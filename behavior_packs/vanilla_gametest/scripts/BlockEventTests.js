import * as GameTest from "mojang-gametest";
import {
  world,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  BlockLocation,
  ItemStack,
  GameMode,
  Direction,
} from "mojang-minecraft";

function registerBlockBreakTest(gameMode, blockType, blockBreakTicks) {
  GameTest.registerAsync("BlockEventTests", `block_break_event_${gameMode}_${blockType.id}`, async (test) => {
    const spawnLocation = new BlockLocation(1, 2, 3);
    const blockLocation = new BlockLocation(2, 2, 2);

    const player = test.spawnSimulatedPlayer(spawnLocation, `${gameMode}_player`, GameMode[gameMode]);

    // Set block
    test.setBlockType(blockType, blockLocation);

    // Listen for block break
    let blockDidBreak = false;
    const listener = (event) => {
      // Make sure it's our block that broke
      const locationCorrect = event.block.location.equals(test.worldBlockLocation(blockLocation));
      const blockTypeCorreect = event.brokenBlockPermutation.type.id == blockType.id;

      if (locationCorrect && blockTypeCorreect) {
        blockDidBreak = true;
      }
    };
    world.events.blockBreak.subscribe(listener);

    // Start breaking block
    player.lookAtBlock(blockLocation);
    player.breakBlock(blockLocation);

    // Wait for the block to be broken
    await test.idle(blockBreakTicks);

    // Unsubscribe
    world.events.blockBreak.unsubscribe(listener);

    if (blockDidBreak) {
      test.succeed();
    } else {
      test.fail(`Block event should have fired for block ${blockType.id}`);
    }
  })
    .structureName("Generic:flat_5x5x5")
    .maxTicks(blockBreakTicks + 10)
    .batch(`block_break_event_${gameMode}_${blockType.id}`)
    .tag(GameTest.Tags.suiteDefault);
}

function registerBlockPlaceTest(itemType, belowBlock) {
  const registerTest = function (gameMode) {
    GameTest.registerAsync("BlockEventTests", `block_place_event_${gameMode}_${itemType.id}`, async (test) => {
      const spawnLocation = new BlockLocation(1, 2, 3);
      const blockLocation = new BlockLocation(2, 1, 2);

      const player = test.spawnSimulatedPlayer(spawnLocation, `${gameMode}_player`, GameMode[gameMode]);

      if (belowBlock) {
        // Set bellow block
        test.setBlockType(belowBlock, blockLocation);
      }

      // Listen for block place
      let blockDidPlace = false;
      const listener = (event) => {
        if (event.block.location.equals(test.worldBlockLocation(blockLocation.offset(0, 1, 0)))) {
          blockDidPlace = true;
        }
      };
      world.events.blockPlace.subscribe(listener);

      await test.idle(10);

      // Start place block
      player.lookAtBlock(blockLocation);
      player.setItem(new ItemStack(itemType, 1), 0, true);
      player.useItemInSlotOnBlock(0, blockLocation, Direction.up, 0.5, 1);

      // Unsubscribe
      world.events.blockPlace.unsubscribe(listener);

      if (blockDidPlace) {
        test.succeed();
      } else {
        test.fail(`Block event should have fired for block ${itemType.id}`);
      }
    })
      .structureName("Generic:flat_5x5x5")
      .maxTicks(20)
      .batch(`block_place_event_${gameMode}_${itemType.id}`)
      .tag(GameTest.Tags.suiteDefault);
  };

  registerTest("survival");
  registerTest("creative");
}

// Break Block Tests
registerBlockBreakTest("creative", MinecraftBlockTypes.dirt, 20);
registerBlockBreakTest("survival", MinecraftBlockTypes.dirt, 100);

// Place Block Tests
// Note: These are fired in a bunch of
//  different spots in the code, hence the different
//  items I chose to test
registerBlockPlaceTest(MinecraftItemTypes.dirt);
registerBlockPlaceTest(MinecraftItemTypes.bamboo, MinecraftBlockTypes.dirt);
registerBlockPlaceTest(MinecraftItemTypes.banner);
registerBlockPlaceTest(MinecraftItemTypes.bed);
registerBlockPlaceTest(MinecraftItemTypes.flowerPot);
registerBlockPlaceTest(MinecraftItemTypes.redstone);
registerBlockPlaceTest(MinecraftItemTypes.oakSign);
