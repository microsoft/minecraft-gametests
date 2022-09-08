import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  ItemStack,
  MinecraftItemTypes,
  Direction,
} from "mojang-minecraft";

function giveItem(player, itemType, amount, slot) {
  const inventoryContainer = player.getComponent("inventory").container;
  inventoryContainer.addItem(new ItemStack(itemType, amount ?? 1));
  player.selectedSlot = slot ?? 0;
}

GameTest.register("PlaceSeedsTests", "place_seed_on_farmland", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const grassBlockLoc = new BlockLocation(1, 1, 1);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      giveItem(player, MinecraftItemTypes.ironHoe, 1, 0);
      giveItem(player, MinecraftItemTypes.wheatSeeds, 1, 1);
    })
    .thenExecuteAfter(10, () => {
      const usedIronhoe = player.useItemInSlotOnBlock(0, grassBlockLoc, Direction.up, 1, 1);

      test.assert(usedIronhoe, "Expected iron hoe to be used");
      test.assertBlockPresent(MinecraftBlockTypes.farmland, grassBlockLoc);
    })
    .thenExecuteAfter(10, () => {
      const usedWheatseeds = player.useItemInSlotOnBlock(1, grassBlockLoc, Direction.up, 1, 1);

      test.assert(usedWheatseeds, "Expected wheat seeds to be used");
      test.assertBlockPresent(MinecraftBlockTypes.wheat, grassBlockLoc.above());
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);