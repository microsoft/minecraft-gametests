import * as GameTest from "GameTest";
import { Blocks, BlockLocation } from "Minecraft";
import { Utilities } from "scripts/Utilities.js";

// Tests the behavior of zombies chasing villagers around some walls.
function zombieVillagerChase(test) {
  const villagerType = "villager_v2";
  const zombieType = "zombie";

  Utilities.addFourNotchedWalls(test, Blocks.brickBlock(), 2, 1, 2, 4, 6, 4);

  test.spawn(villagerType, new BlockLocation(1, 3, 1));
  test.spawn(zombieType, new BlockLocation(5, 3, 5));

  test.runAtTickTime(180, () => {
    test.assertEntityPresentInArea(villagerType);
    test.succeed();
  });
}

GameTest.register("MobBehaviorTests", "zombie_villager_chase", zombieVillagerChase)
  .batch("night")
  .structureName("MobBehaviorTests:glass_pit")
  .maxTicks(2000);

// Tests basic toughness of the iron golem, and that it will defeat skeletons and zombies.
function ironGolemArena(test) {
  const ironGolemType = "iron_golem";
  const skeletonType = "skeleton";
  const zombieType = "zombie";

  test.spawn(ironGolemType, new BlockLocation(4, 3, 3));
  test.spawn(skeletonType, new BlockLocation(5, 3, 5));
  test.spawn(skeletonType, new BlockLocation(4, 3, 4));
  test.spawn(skeletonType, new BlockLocation(3, 3, 3));
  test.spawn(zombieType, new BlockLocation(4, 3, 6));
  test.spawn(zombieType, new BlockLocation(3, 3, 5));
  test.spawn(zombieType, new BlockLocation(2, 3, 4));
  test.spawn(zombieType, new BlockLocation(5, 3, 2));

  test.succeedWhen(() => {
    test.assertEntityNotPresentInArea(zombieType);
    test.assertEntityNotPresentInArea(skeletonType);
    test.assertEntityPresentInArea(ironGolemType);
  });
}

GameTest.register("MobBehaviorTests", "iron_golem_arena", ironGolemArena)
  .batch("night")
  .structureName("MobBehaviorTests:mediumglass")
  .maxTicks(810);

// Tests the behavior that a Shulker's attack will cause a Zoglin to float.
function zoglinFloat(test) {
  const zoglinType = "zoglin";
  const shulkerType = "shulker";

  test.spawn(zoglinType, new BlockLocation(5, 2, 5));
  test.spawn(shulkerType, new BlockLocation(2, 2, 2));

  test.succeedWhen(() => {
    // has the zoglin floated up to the top of the cage?
    Utilities.assertEntityInSpecificArea(test, zoglinType, 1, 7, 1, 10, 10, 10);
  });
}

GameTest.register("MobBehaviorTests", "zoglin_float", zoglinFloat)
  .batch("night")
  .structureName("MobBehaviorTests:mediumglass")
  .maxTicks(210);

// This tests a particular behavior that the phantom /should/ fly away from a cat, but
// gets 'stuck' to the cat and doesn't fly away
function phantomsShouldFlyFromCats(test) {
  let catEntityType = "cat";
  const phantomEntityType = "phantom";

  test.spawn(catEntityType, new BlockLocation(4, 3, 3));
  test.spawn(phantomEntityType, new BlockLocation(4, 3, 3));

  test.succeedWhenEntityPresent(phantomEntityType, new BlockLocation(4, 6, 3)); // has the phantom flown up in their column?
}

GameTest.register("MobBehaviorTests", "phantoms_should_fly_from_cats", phantomsShouldFlyFromCats)
  .structureName("gametests:glass_cells")
  .tag("suite:broken");
