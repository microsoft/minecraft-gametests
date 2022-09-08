import * as GameTest from "mojang-gametest";
import { BlockLocation, Location } from "mojang-minecraft";

const TicksPerSecond = 20;

GameTest.register("WaterPathfindingTests", "axolotl_lava_walkaround", (test) => {
  const spawnType = "minecraft:axolotl";
  const mob = test.spawnWithoutBehaviorsAtLocation(spawnType, new Location(0.0, 3.0, 2.0));
  const targetPos = new BlockLocation(6, 3, 2);
  test.walkTo(mob, targetPos, 1);
  test.succeedWhenEntityPresent(spawnType, targetPos, true);
})
  .maxTicks(TicksPerSecond * 20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("WaterPathfindingTests", "fish_corner_swimaround", (test) => {
  const spawnType = "minecraft:tropicalfish";
  const mob = test.spawnWithoutBehaviorsAtLocation(spawnType, new Location(1.5, 2.0, 1.5));
  const targetPos = new BlockLocation(3, 2, 3);
  test.walkTo(mob, targetPos, 1);
  test.succeedWhenEntityPresent(spawnType, targetPos, true);
})
  .maxTicks(TicksPerSecond * 20)
  .tag(GameTest.Tags.suiteDefault);
