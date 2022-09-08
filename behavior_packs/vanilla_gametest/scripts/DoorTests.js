import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const DOOR_TEST_PADDING = 100; // The padding for the door tests will need to be increased some more to prevent the interference

GameTest.register("DoorTests", "four_villagers_one_door", (test) => {
  const villagerEntityType = "minecraft:villager_v2";
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>"; // Attempt to spawn the villagers as farmers

  test.spawn(villagerEntitySpawnType, new BlockLocation(5, 2, 4));
  test.spawn(villagerEntitySpawnType, new BlockLocation(4, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(1, 2, 4));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 2), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 1), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 2), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 1), true);
  });
})
  .tag(GameTest.Tags.suiteDisabled) // Villagers can get stuck on the door or on sleeping villagers
  .padding(DOOR_TEST_PADDING) // Space out villager tests to stop them from confusing each other
  .batch("night") // This should be a constant at some point
  .maxTicks(600);

GameTest.register("DoorTests", "villagers_can_pass_open_iron_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(2, 2, 5));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(1, 2, 1), true);
})
  .maxTicks(900) //Increase max ticks from 200 to 900 (same value as in PathFindingTests), to make sure villager can find and go to bed
  .batch("night")
  .required(false)
  .padding(DOOR_TEST_PADDING)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DoorTests", "villagers_cant_pass_closed_iron_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(2, 2, 5));

  test
    .startSequence()
    .thenExecute(() => {
      test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 1), false);
    })
    .thenIdle(200)
    .thenSucceed();
})
  .maxTicks(220)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DoorTests", "door_maze", (test) => {
  const villagerActor = "minecraft:villager_v2";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); // Both of Java and Bedrock are failed villager is stuck and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_3d", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed looks like he doesn't cross obstacle and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_crowded", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(3, 2, 2));
  test.spawn(villagerActor, new BlockLocation(5, 2, 1));
  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(4, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(2, 2, 7), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 8), true);
  });
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, some villiages are stuck behind the door and doesn't find the path.

GameTest.register("DoorTests", "inverted_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(3, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(3, 2, 5), true);
})
  .maxTicks(200)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, village is stuck behind the door, at there all time.

GameTest.register("DoorTests", "close_door_after_passing_through", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(4, 2, 1));
  test.spawn(villagerActor, new BlockLocation(5, 2, 1));
  test.spawn(villagerActor, new BlockLocation(7, 2, 1));
  test.spawn(villagerActor, new BlockLocation(9, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(3, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(5, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(7, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(9, 2, 8), true);

    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(9, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(7, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(5, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(4, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(2, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(2, 2, 5));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 5));
  });
})
  .maxTicks(900)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Unstable, Villager sometimes cannot find the bed. Also, Sometimes when multiple villagers passing through the door, the door cannot close. Fail rate: 44%.

GameTest.register("DoorTests", "close_door_even_if_near_bed", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(3, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 4), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(3, 2, 5), true);

    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 3));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(3, 2, 3));
  });
})
  .maxTicks(900)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Unstable, Villager sometimes cannot find the bed. Fail rate: 5%
