import * as GameTest from "mojang-gametest";
import { BlockLocation, Location } from "mojang-minecraft";

GameTest.register("SmallMobTests", "fence_corner", (test) => {
  const piglinEntityType = "minecraft:piglin<minecraft:entity_born>";
  const entityLoc = new Location(0.8, 2, 0.8);
  const piglin = test.spawnWithoutBehaviorsAtLocation(piglinEntityType, entityLoc);

  const targetPos = new BlockLocation(3, 2, 3);
  test.walkTo(piglin, targetPos, 1);
  test.succeedWhenEntityPresent(piglinEntityType, targetPos, true);
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SmallMobTests", "fence_side", (test) => {
  const piglinEntityType = "minecraft:piglin<minecraft:entity_born>";
  const entityLoc = new Location(2.8, 2, 2.05);
  const piglin = test.spawnWithoutBehaviorsAtLocation(piglinEntityType, entityLoc);

  const targetPos = new BlockLocation(0, 2, 2);
  test.walkTo(piglin, targetPos, 1);
  test.succeedWhenEntityPresent(piglinEntityType, targetPos, true);
  test.runAfterDelay(10, () => {
    test.assertCanReachLocation(piglin, targetPos, false);
    test.succeed();
  });
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SmallMobTests", "fence_post", (test) => {
  const chickenEntityType = "minecraft:chicken";
  const entityLoc = new BlockLocation(1, 2, 1);
  const chicken = test.spawnWithoutBehaviors(chickenEntityType, entityLoc);

  const targetPos = new BlockLocation(3, 2, 3);
  test.walkTo(chicken, targetPos, 1);
  test.succeedWhenEntityPresent(chickenEntityType, targetPos, true);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //game parity,the chicken cannot walk between the fenceposts
