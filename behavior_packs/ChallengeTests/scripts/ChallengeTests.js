import * as GameTest from "GameTest";
import { BlockTypes, BlockLocation, World } from "Minecraft";
import { Utilities } from "scripts/Utilities.js";

function minibiomes(test) {
  let minecartEntityType = "minecart";
  let pigEntityType = "pig";

  let minecart = test.spawn(minecartEntityType, new BlockLocation(9, 7, 7));
  let pig = test.spawn(pigEntityType, new BlockLocation(9, 7, 7));

  test.setBlockType(BlockTypes.cobblestone, new BlockLocation(10, 7, 7));

  let minecartRideableComp = minecart.getComponent("minecraft:rideable");

  minecartRideableComp.addRider(pig);

  test.succeedWhenEntityPresent(pigEntityType, new BlockLocation(8, 3, 1));
}

GameTest.register("ChallengeTests", "minibiomes", minibiomes).structureName("gametests:minibiomes").maxTicks(160);

function collapsing(test) {
  const zoglinEntityType = "zoglin";
  const shulkerEntityType = "shulker";

  for (let i = 0; i < 3; i++) {
    test.spawn(zoglinEntityType, new BlockLocation(i + 2, 2, 3));
    test.spawn(shulkerEntityType, new BlockLocation(4, 2, i + 2));
  }

  test.pressButton(new BlockLocation(6, 8, 5));

  test.succeedWhen(() => {
    Utilities.assertEntityInSpecificArea(test, zoglinEntityType, 0, 8, 0, 12, 12, 12);
  });
}

GameTest.register("ChallengeTests", "collapsing", collapsing).structureName("gametests:collapsing_space").maxTicks(160);
