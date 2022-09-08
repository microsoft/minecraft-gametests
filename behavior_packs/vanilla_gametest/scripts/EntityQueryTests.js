import GameTestExtensions from "./GameTestExtensions.js";
import * as GameTest from "mojang-gametest";
import {
  BlockAreaSize,
  BlockLocation,
  EntityQueryOptions,
  EntityQueryScoreOptions,
  GameMode,
  Location,
  world,
} from "mojang-minecraft";

GameTest.register("EntityQueryTests", "world_player_query", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "world_player_1");
  test.spawnSimulatedPlayer(new BlockLocation(0, 2, 1), "world_player_2");

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      let options = { name: player.nameTag };
      const playerIterator = world.getPlayers(options);
      const iteratorType = playerIterator.constructor.toString().match(/function (\w*)/)[1];
      test.assert(iteratorType == "PlayerIterator", "Expected PlayerIterator, got " + iteratorType);
      const players = Array.from(playerIterator);
      test.assert(players.length === 1 && players[0] === player, "Unexpected player");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "dimension_player_query", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "dimension_player_1");
  test.spawnSimulatedPlayer(new BlockLocation(0, 2, 1), "dimension_player_2");

  await test.idle(2);

  let options = { name: player.nameTag };
  const dimension = test.getDimension();
  const players = Array.from(dimension.getPlayers(options));
  test.assert(players.length === 1 && players[0] === player, "Unexpected player");

  const overworld = world.getDimension("overworld");
  const nether = world.getDimension("nether");
  let otherDimension = dimension === overworld ? nether : overworld;

  const otherPlayers = Array.from(otherDimension.getPlayers(options));
  test.assert(otherPlayers.length === 0, "Unexpected player in other dimension");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "dimension_entity_query", (test) => {
  const testEx = new GameTestExtensions(test);

  const createQueryOptions = function () {
    let options = {
      location: test.worldLocation(new Location(1, 2, 1)),
      volume: testEx.rotateVolume(new BlockAreaSize(5, 3, 5)),
    };
    return options;
  };

  const assertEntitiesMatch = function (testName, entities, expected) {
    entities = Array.from(entities);
    if (entities.length != expected.length) {
      throw `Test Case "${testName}" - Unexpected number of selected entities. Expected: ${expected.length} Actual: ${entities.length}`;
    }
    for (const entity of expected) {
      if (!entities.includes(entity)) {
        for (const e2 of entities) {
          test.print("ID: " + e2.id);
        }
        throw `Test Case "${testName}" - Missing expected entity: ${entity.id} ${entity.nameTag}`;
      }
    }
  };

  const p1Name = "selector_player_1_" + test.getTestDirection();
  const p2Name = "selector_player_2_" + test.getTestDirection();

  // Entity Grid
  // e8|e7|e6
  // e5|e4|e3
  // e2|e1|e0
  const e0 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const e1 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 1));
  const e2 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 1));
  const e3 = test.spawn("minecraft:husk<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 3));
  const e4 = test.spawn("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));
  const e5 = test.spawn("minecraft:sheep<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 3));
  const e6 = test.spawn("minecraft:sheep<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 5));
  const e7 = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 5), p1Name);
  const e8 = test.spawnSimulatedPlayer(new BlockLocation(5, 2, 5), p2Name);

  const dimension = test.getDimension();

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      dimension.runCommand(`tag @a[name=${p1Name}] add selector_tag`);
      dimension.runCommand(`gamemode creative @a[name=${p1Name}]`);
      dimension.runCommand(`xp 7 @a[name=${p1Name}]`); // level 1
      try {
        dimension.runCommand("scoreboard objectives add test_objective dummy");
      } catch {}
      dimension.runCommand(`scoreboard players set ${p1Name} test_objective 2`); // set test_objective=2 for player 1
      dimension.runCommand(`scoreboard players set ${p2Name} test_objective 0`); // set test_objective=2 for player 2
      e7.setBodyRotation(90);
      e8.lookAtBlock(new BlockLocation(5, 2, 6)); // Look down ~48 degrees
    })
    .thenExecuteAfter(5, () => {
      let options0 = createQueryOptions();
      options0.type = "sheep";
      assertEntitiesMatch("select sheep", dimension.getEntities(options0), [e5, e6]);
      options0.type = undefined;
      options0.excludeTypes = ["sheep"];
      assertEntitiesMatch("exclude sheep", dimension.getEntities(options0), [e0, e1, e2, e3, e4, e7, e8]);

      let options1 = createQueryOptions();
      options1.families = ["zombie"];
      assertEntitiesMatch("select zombies", dimension.getEntities(options1), [e3, e4]);
      options1.families = [];
      options1.excludeFamilies = ["zombie"];
      assertEntitiesMatch("exclude zombies", dimension.getEntities(options1), [e0, e1, e2, e5, e6, e7, e8]);

      let options2 = createQueryOptions();
      options2.type = "cow";
      options2.closest = 2;
      assertEntitiesMatch("select 2 closest cows", dimension.getEntities(options2), [e0, e1]);

      let options3 = createQueryOptions();
      options3.type = "cow";
      options3.farthest = 2;
      assertEntitiesMatch("select 2 farthest cows", dimension.getEntities(options3), [e1, e2]);

      let options4 = createQueryOptions();
      options4.tags = ["selector_tag"];
      assertEntitiesMatch("select entities tag", dimension.getEntities(options4), [e7]);
      assertEntitiesMatch("select players tag", dimension.getPlayers(options4), [e7]);

      let options5 = createQueryOptions();
      options5.excludeTags = ["selector_tag"];
      assertEntitiesMatch("exclude tag", dimension.getEntities(options5), [e0, e1, e2, e3, e4, e5, e6, e8]);

      let options6 = createQueryOptions();
      options6.minDistance = 4;
      assertEntitiesMatch("select min distance 4", dimension.getEntities(options6), [e2, e5, e6, e7, e8]);

      let options7 = createQueryOptions();
      options7.maxDistance = 6;
      assertEntitiesMatch("select max distance 6", dimension.getEntities(options7), [e0, e1, e2, e3, e4, e5, e6, e7]);

      let options8 = createQueryOptions();
      options8.minDistance = 4;
      options8.maxDistance = 6;
      assertEntitiesMatch("select distance 4-6", dimension.getEntities(options8), [e2, e5, e6, e7]);

      let options9 = createQueryOptions();
      options9.volume = testEx.rotateVolume(new BlockAreaSize(3, 3, 3));
      assertEntitiesMatch("select volume", dimension.getEntities(options9), [e0, e1, e3, e4]);

      let options10 = createQueryOptions();
      options10.gameMode = GameMode.creative;
      assertEntitiesMatch("select entities gamemode", dimension.getEntities(options10), [e7]);
      assertEntitiesMatch("select players gamemode", dimension.getPlayers(options10), [e7]);

      let options11 = createQueryOptions();
      options11.excludeGameModes = [GameMode.creative];
      assertEntitiesMatch("exclude entities gamemode", dimension.getEntities(options11), [e8]);
      assertEntitiesMatch("exclude players gamemode", dimension.getPlayers(options11), [e8]);

      let options12 = createQueryOptions();
      options12.name = p1Name;
      assertEntitiesMatch("select entities name", dimension.getEntities(options12), [e7]);
      assertEntitiesMatch("select players name", dimension.getPlayers(options12), [e7]);

      let options13 = createQueryOptions();
      options13.excludeNames = [p1Name];
      assertEntitiesMatch("exclude name", dimension.getEntities(options13), [e0, e1, e2, e3, e4, e5, e6, e8]);

      let options14 = createQueryOptions();
      options14.maxLevel = 1;
      options14.minLevel = 1;
      assertEntitiesMatch("select entities level 1", dimension.getEntities(options14), [e7]);
      assertEntitiesMatch("select players level 1", dimension.getPlayers(options14), [e7]);

      let options15 = createQueryOptions();
      options15.maxLevel = 0;
      assertEntitiesMatch("select entities max level 0", dimension.getEntities(options15), [e8]);
      assertEntitiesMatch("select players max level 0", dimension.getPlayers(options15), [e8]);

      let options16 = createQueryOptions();
      options16.minHorizontalRotation = testEx.rotateAngle(90);
      options16.maxHorizontalRotation = testEx.rotateAngle(90);
      assertEntitiesMatch("select entities horizontal rotation 90", dimension.getEntities(options16), [e7]);
      assertEntitiesMatch("select players horizontal rotation 90", dimension.getPlayers(options16), [e7]);

      let options17 = createQueryOptions();
      options17.minVerticalRotation = 45;
      options17.maxVerticalRotation = 50;
      assertEntitiesMatch("select entities vertical rotation 45-50", dimension.getEntities(options17), [e8]);
      assertEntitiesMatch("select players vertical rotation 45-50", dimension.getPlayers(options17), [e8]);

      let options18 = createQueryOptions();
      let scoreFilter18 = {};
      scoreFilter18.objective = "test_objective";
      scoreFilter18.minScore = 2;
      scoreFilter18.maxScore = 2;
      options18.scoreOptions = [scoreFilter18];
      assertEntitiesMatch("select entities test_objective score 2", dimension.getEntities(options18), [e7]);
      assertEntitiesMatch("select players test_objective score 2", dimension.getPlayers(options18), [e7]);

      let options19 = createQueryOptions();
      let scoreFilter19 = {};
      scoreFilter19.objective = "test_objective";
      scoreFilter19.minScore = 2;
      scoreFilter19.maxScore = 2;
      scoreFilter19.exclude = true;
      options19.scoreOptions = [scoreFilter19];
      assertEntitiesMatch("exclude entities test_objective score 2", dimension.getEntities(options19), [e8]);
      assertEntitiesMatch("exclude players test_objective score 2", dimension.getPlayers(options19), [e8]);

      let options20 = createQueryOptions();
      let scoreFilter20 = {};
      scoreFilter20.objective = "test_objective";
      scoreFilter20.maxScore = 1;
      options20.scoreOptions = [scoreFilter20];
      assertEntitiesMatch("select entities test_objective max score 2", dimension.getEntities(options20), [e8]);
      assertEntitiesMatch("select players test_objective max score 2", dimension.getPlayers(options20), [e8]);

      let options21 = createQueryOptions();
      let scoreFilter21 = {};
      scoreFilter21.objective = "test_objective";
      scoreFilter21.minScore = 1;
      options21.scoreOptions = [scoreFilter21];
      assertEntitiesMatch("select entities test_objective min score 1", dimension.getEntities(options21), [e7]);
      assertEntitiesMatch("select players test_objective min score 1", dimension.getPlayers(options21), [e7]);

      let options22 = createQueryOptions();
      let scoreFilter22 = {};
      scoreFilter22.objective = "test_objective";
      scoreFilter22.minScore = 1;
      scoreFilter22.exclude = true;
      options22.scoreOptions = [scoreFilter22];
      assertEntitiesMatch("exclude entities test_objective min score 1", dimension.getEntities(options22), [e8]);
      assertEntitiesMatch("exclude players test_objective min score 1", dimension.getPlayers(options22), [e8]);

      let options23 = createQueryOptions();
      options23.maxLevel = 3;
      options23.minLevel = 4;
      try {
        dimension.getEntities(options23);
        test.fail("Expected getEnities to throw (options23)");
      } catch {} // error: minLevel > maxLevel

      let options24 = createQueryOptions();
      options24.maxVerticalRotation = 91;
      try {
        dimension.getEntities(options24);
        test.fail("Expected getEnities to throw (options24)");
      } catch {} // error: maxVerticalRotation > 90

      let options25 = createQueryOptions();
      options25.maxHorizontalRotation = 181;
      try {
        dimension.getEntities(options25);
        test.fail("Expected getEnities to throw (options25)");
      } catch {} // error: maxHorizontalRotation > 180

      let options26 = createQueryOptions();
      options26.closest = 0;
      try {
        dimension.getEntities(options26);
        test.fail("Expected getEnities to throw (options26)");
      } catch {} // error: nearest == 0

      let options27 = createQueryOptions();
      options27.farthest = 0;
      try {
        dimension.getEntities(options27);
        test.fail("Expected getEnities to throw (options27)");
      } catch {} // error: farthest == 0

      let options28 = createQueryOptions();
      options28.closest = 1;
      options28.farthest = 1;
      try {
        dimension.getEntities(options28);
        test.fail("Expected getEnities to throw (options28)");
      } catch {} // error: closest and farthest both set
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "world_player_query_positional_option_exception", (test) => {
  let assertQueryPositionalOptionException = (options, propertyName) => {
    try {
      world.getPlayers(options);
      test.fail(`Expected world.getPlayers to throw with assigned property '${propertyName}'`);
    } catch (ex) {
      test.assert(
        ex === `EntityQueryOptions property '${propertyName}' is incompatible with function world.getPlayers`,
        `Unexpected exception: ${ex}`
      );
    }
  };

  test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "world_player_1");
  let options = {};
  options.location = new Location(0, 2, 1);
  assertQueryPositionalOptionException(options, "location");

  options = {};
  options.closest = 1;
  assertQueryPositionalOptionException(options, "closest");

  options = {};
  options.farthest = 1;
  assertQueryPositionalOptionException(options, "farthest");

  options = {};
  options.maxDistance = 1;
  assertQueryPositionalOptionException(options, "maxDistance");

  options = {};
  options.minDistance = 1;
  assertQueryPositionalOptionException(options, "minDistance");

  options = {};
  options.volume = new BlockAreaSize(1, 1, 1);
  assertQueryPositionalOptionException(options, "volume");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);
