import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftItemTypes, world } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

function placeDripstoneTip(test, pos, hanging, waterlogged = false) {
  const pointedDripstonePermutation = MinecraftBlockTypes.pointedDripstone.createDefaultBlockPermutation();
  pointedDripstonePermutation.getProperty("hanging").value = hanging;
  pointedDripstonePermutation.getProperty("dripstone_thickness").value = "tip";

  const pointedDripstoneBlock = test.getDimension().getBlock(test.worldBlockLocation(pos));
  pointedDripstoneBlock.setPermutation(pointedDripstonePermutation);
  pointedDripstoneBlock.isWaterlogged = waterlogged;
}

function assertDripstone(test, pos, hanging, thickness, waterlogged = false) {
  const testEx = new GameTestExtensions(test);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, pos, true);
  test.assertIsWaterlogged(pos, waterlogged);
  testEx.assertBlockProperty("hanging", hanging, pos);
  testEx.assertBlockProperty("dripstone_thickness", thickness, pos);
}

function assertColumnBaseToTip(test, basePos, hanging, ...thicknesses) {
  let checkPos = basePos;
  for (const thickness of thicknesses) {
    assertDripstone(test, checkPos, hanging, thickness);
    if (hanging == true) {
      checkPos = checkPos.offset(0, -1, 0);
    } else {
      checkPos = checkPos.offset(0, 1, 0);
    }
  }
}

///
// Concrete Tests
///
GameTest.register("DripstoneTests", "thickness_update", (test) => {
  // Check that each stalactite got loaded correctly
  assertColumnBaseToTip(test, new BlockLocation(0, 12, 0), true, "base", "middle", "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(1, 12, 0), true, "base", "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(2, 12, 0), true, "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(3, 12, 0), true, "tip");

  // Check that each stalagmite got loaded correctly
  assertColumnBaseToTip(test, new BlockLocation(0, 2, 0), false, "base", "middle", "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(1, 2, 0), false, "base", "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(2, 2, 0), false, "frustum", "tip");
  assertColumnBaseToTip(test, new BlockLocation(3, 2, 0), false, "tip");

  // Extend each stalactite
  placeDripstoneTip(test, new BlockLocation(0, 8, 0), true);
  placeDripstoneTip(test, new BlockLocation(1, 9, 0), true);
  placeDripstoneTip(test, new BlockLocation(2, 10, 0), true);
  placeDripstoneTip(test, new BlockLocation(3, 11, 0), true);

  // Extend each stalagmite
  placeDripstoneTip(test, new BlockLocation(0, 6, 0), false);
  placeDripstoneTip(test, new BlockLocation(1, 5, 0), false);
  placeDripstoneTip(test, new BlockLocation(2, 4, 0), false);
  placeDripstoneTip(test, new BlockLocation(3, 3, 0), false);

  test.succeedIf(() => {
    // Check the shape of each stalactite
    assertColumnBaseToTip(test, new BlockLocation(0, 12, 0), true, "base", "middle", "middle", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(1, 12, 0), true, "base", "middle", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(2, 12, 0), true, "base", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(3, 12, 0), true, "frustum", "tip");

    // Check the shape of each stalagmite
    assertColumnBaseToTip(test, new BlockLocation(0, 2, 0), false, "base", "middle", "middle", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(1, 2, 0), false, "base", "middle", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(2, 2, 0), false, "base", "frustum", "tip");
    assertColumnBaseToTip(test, new BlockLocation(3, 2, 0), false, "frustum", "tip");
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalactite_fall", (test) => {
  const landingPos = new BlockLocation(1, 2, 1);
  test.assertEntityPresent("minecraft:item", landingPos, false);

  test.pressButton(new BlockLocation(0, 3, 0));
  test.succeedWhenEntityPresent("minecraft:item", landingPos, true);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Test failed occasionally due to bug 587521: Collision box of pointed dripstone becomes larger and offsets when falling.

GameTest.register("DripstoneTests", "stalactite_fall_bedrock", (test) => {
  const landingPos = new BlockLocation(1, 2, 1);
  test.assertEntityPresent("minecraft:item", landingPos, false);

  test.pressButton(new BlockLocation(0, 3, 0));
  test.succeedWhenEntityPresent("minecraft:item", landingPos, true);
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalactite_hurt", (test) => {
  const poorInnocentVictimPos = new BlockLocation(1, 2, 1);
  const poorInnocentVictim = test.spawnWithoutBehaviors("minecraft:pig", poorInnocentVictimPos);

  test.pressButton(new BlockLocation(0, 6, 0));

  const healthComponent = poorInnocentVictim.getComponent("minecraft:health");

  test.succeedWhen(() => {
    test.assert(healthComponent.current < healthComponent.value, "Mob should be hurt!");
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalagmite_break", (test) => {
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 3, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), true);

  test.pressButton(new BlockLocation(0, 3, 0));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), false);
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 3, 1), false);
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), false);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalagmite_stalactite_separation", (test) => {
  assertColumnBaseToTip(test, new BlockLocation(1, 2, 1), false, "frustum", "merge");
  assertColumnBaseToTip(test, new BlockLocation(1, 5, 1), true, "frustum", "merge");
  assertColumnBaseToTip(test, new BlockLocation(2, 2, 1), false, "frustum", "merge");
  assertColumnBaseToTip(test, new BlockLocation(2, 5, 1), true, "frustum", "merge");

  test.pressButton(new BlockLocation(0, 3, 0));
  test.pressButton(new BlockLocation(3, 4, 0));

  test.succeedWhen(() => {
    // the right-hand stalagmite should be gone
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), false);
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 3, 1), false);

    // the right-hand stalactite should be intact, but the tip should no longer be a merged tip
    assertColumnBaseToTip(test, new BlockLocation(1, 5, 1), true, "frustum", "tip");

    // the left-hand stalagmite should be intact, but the tip should no longer be a merged tip
    assertColumnBaseToTip(test, new BlockLocation(2, 2, 1), false, "frustum", "tip");

    // the left-hand stalactite should be gone
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(2, 5, 1), false);
    test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(2, 4, 1), false);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalagmite_hurt", (test) => {
  const unluckyPig = test.spawn("minecraft:pig", new BlockLocation(1, 4, 1));
  const luckyPig = test.spawn("minecraft:pig", new BlockLocation(3, 4, 1));

  const unluckyPigHealthComponent = unluckyPig.getComponent("minecraft:health");
  const luckyPigHealthComponent = luckyPig.getComponent("minecraft:health");

  test.succeedWhen(() => {
    test.assert(unluckyPigHealthComponent.current < unluckyPigHealthComponent.value, "This pig should be hurt!");
    test.assert(luckyPigHealthComponent.current == luckyPigHealthComponent.value, "This pig shouldn't be hurt!");
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("DripstoneTests", "stalactite_fall_no_dupe", (test) => {
  test.pressButton(new BlockLocation(4, 9, 0));
  test.pressButton(new BlockLocation(8, 8, 0));
  test.pressButton(new BlockLocation(12, 6, 0));
  test.pressButton(new BlockLocation(16, 5, 0));

  test
    .startSequence()
    .thenExecuteAfter(60, () => {
      test.assertItemEntityCountIs(MinecraftItemTypes.pointedDripstone, new BlockLocation(2, 2, 2), 1, 5);
      test.assertItemEntityCountIs(MinecraftItemTypes.pointedDripstone, new BlockLocation(6, 2, 2), 1, 5);
      test.assertItemEntityCountIs(MinecraftItemTypes.pointedDripstone, new BlockLocation(10, 2, 2), 1, 2);
      test.assertItemEntityCountIs(MinecraftItemTypes.pointedDripstone, new BlockLocation(14, 2, 2), 1, 2);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);
