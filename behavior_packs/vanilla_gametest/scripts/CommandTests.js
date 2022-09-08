import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";

///
// Commands
///

GameTest.registerAsync("CommandTests", "commands_api_player_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const player = test.spawnSimulatedPlayer(startLoc, "Teleport-o-man"); // This line is never getting hit?!

  await test.idle(20);
  test.assertEntityInstancePresent(player, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  player.runCommand(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);

  await test.idle(20);
  test.assertEntityInstancePresent(player, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_pig_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const entity = test.spawn("minecraft:pig", startLoc);

  await test.idle(20);
  test.assertEntityInstancePresent(entity, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  entity.runCommand(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);

  await test.idle(20);
  test.assertEntityInstancePresent(entity, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_dimension_spawn_pig", async (test) => {
  const spawnLoc = new BlockLocation(6, 2, 1);

  const absSpawnLoc = test.worldBlockLocation(new BlockLocation(6, 2, 1));
  test.getDimension().runCommand(`summon minecraft:pig ${absSpawnLoc.x} ${absSpawnLoc.y} ${absSpawnLoc.z}`);

  await test.idle(20);
  test.assertEntityPresent("minecraft:pig", spawnLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_execute_vs_player", async (test) => {
  const spawnLoc1 = new BlockLocation(1, 2, 1);
  const spawnLoc2 = new BlockLocation(3, 2, 1);
  const playerName1 = "Sim Player (execute at)";
  const playerName2 = "Sim Player (runCommand)";
  const player1 = test.spawnSimulatedPlayer(spawnLoc1, playerName1);
  const player2 = test.spawnSimulatedPlayer(spawnLoc2, playerName2);

  // Spawn blocks
  await test.idle(20);

  test.getDimension().runCommand(`execute "${playerName1}" ~ ~ ~ setblock ~ ~2 ~ stone`);
  player2.runCommand(`setblock ~ ~2 ~ stone`);

  // Test for blocks
  await test.idle(40);

  test.assert(
    test.getBlock(new BlockLocation(1, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName1}.`
  );
  test.assert(
    test.getBlock(new BlockLocation(3, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName2}.`
  );
  test.succeed();
})
  .structureName("CommandTests:doublecage")
  .maxTicks(100);

///
// Async Commands
///

GameTest.registerAsync("CommandTests", "async_commands_api_player_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const player = test.spawnSimulatedPlayer(startLoc, "Teleport-o-man"); // This line is never getting hit?!

  await test.idle(20);
  test.assertEntityInstancePresent(player, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  let result = await player.runCommandAsync(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  await test.idle(20);
  test.assertEntityInstancePresent(player, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "async_commands_api_dimension_spawn_pig", async (test) => {
  const spawnLoc = new BlockLocation(6, 2, 1);

  const absSpawnLoc = test.worldBlockLocation(new BlockLocation(6, 2, 1));
  let result = await test.getDimension().runCommandAsync(`summon minecraft:pig ${absSpawnLoc.x} ${absSpawnLoc.y} ${absSpawnLoc.z}`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  await test.idle(20);
  test.assertEntityPresent("minecraft:pig", spawnLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "async_commands_api_execute_vs_player", async (test) => {
  const spawnLoc1 = new BlockLocation(1, 2, 1);
  const spawnLoc2 = new BlockLocation(3, 2, 1);
  const playerName1 = "Sim Player (execute at)";
  const playerName2 = "Sim Player (runCommand)";
  const player1 = test.spawnSimulatedPlayer(spawnLoc1, playerName1);
  const player2 = test.spawnSimulatedPlayer(spawnLoc2, playerName2);

  // Spawn blocks
  await test.idle(20);

  let result = await test.getDimension().runCommandAsync(`execute "${playerName1}" ~ ~ ~ setblock ~ ~2 ~ stone`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  player2.runCommand(`setblock ~ ~2 ~ stone`);

  // Test for blocks
  await test.idle(40);

  test.assert(
    test.getBlock(new BlockLocation(1, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName1}.`
  );
  test.assert(
    test.getBlock(new BlockLocation(3, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName2}.`
  );
  test.succeed();
})
  .structureName("CommandTests:doublecage")
  .maxTicks(100);
