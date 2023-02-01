// Copyright (c) Microsoft Corporation.  All rights reserved.

import * as GameTest from "@minecraft/server-gametest";
import { BlockLocation, MinecraftBlockTypes, Location, Vector } from "@minecraft/server";

const replacementBlock = MinecraftBlockTypes.redGlazedTerracotta;

function lookAtThree(test, blocks, blockVectorOptions) {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 9, 2), "Player");

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      player.lookAtBlock(blocks[0]);
    })
    .thenExecuteAfter(10, () => {
      var block = player.getBlockFromViewDirection(blockVectorOptions);
      const relativePos = test.relativeBlockLocation(block.location);
      test.assert(
        relativePos.equals(blocks[0]),
        "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]"
      );
      block.setType(replacementBlock);

      player.lookAtBlock(blocks[1]);
    })
    .thenExecuteAfter(10, () => {
      var block = player.getBlockFromViewDirection(blockVectorOptions);
      const relativePos = test.relativeBlockLocation(block.location);
      test.assert(
        relativePos.equals(blocks[1]),
        "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]"
      );
      block.setType(replacementBlock);
      player.lookAtBlock(blocks[2]);
    })
    .thenExecuteAfter(10, () => {
      var block = player.getBlockFromViewDirection(blockVectorOptions);
      const relativePos = test.relativeBlockLocation(block.location);
      test.assert(
        relativePos.equals(blocks[2]),
        "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]"
      );
      block.setType(replacementBlock);
    })
    .thenSucceed();
}

GameTest.register("RaycastingTests", "player_looks_under_water", (test) => {
  var blocks = [new BlockLocation(1, 1, 1), new BlockLocation(2, 1, 1), new BlockLocation(3, 1, 1)];

  const blockVectorOptions = {
    includePassableBlocks: false,
    includeLiquidBlocks: false,
  };

  lookAtThree(test, blocks, blockVectorOptions);
})
  .maxTicks(50)
  .structureName("RaycastingTests:player_looks_block")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_water", (test) => {
  var blocks = [new BlockLocation(1, 2, 1), new BlockLocation(2, 2, 1), new BlockLocation(3, 2, 1)];

  const blockVectorOptions = {
    includePassableBlocks: true,
    includeLiquidBlocks: true,
  };

  lookAtThree(test, blocks, blockVectorOptions);
})
  .maxTicks(50)
  .structureName("RaycastingTests:player_looks_block")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_under_carpet", (test) => {
  var blocks = [new BlockLocation(1, 2, 0), new BlockLocation(2, 2, 0), new BlockLocation(3, 2, 0)];

  const blockVectorOptions = {
    includePassableBlocks: false,
    includeLiquidBlocks: false,
  };

  lookAtThree(test, blocks, blockVectorOptions);
})
  .maxTicks(50)
  .structureName("RaycastingTests:player_looks_block")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_carpet", (test) => {
  var blocks = [new BlockLocation(1, 3, 0), new BlockLocation(2, 3, 0), new BlockLocation(3, 3, 0)];

  const blockVectorOptions = {
    includePassableBlocks: true,
    includeLiquidBlocks: false,
  };

  lookAtThree(test, blocks, blockVectorOptions);
})
  .maxTicks(50)
  .structureName("RaycastingTests:player_looks_block")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "get_block_from_vector", (test) => {
  let dimension = test.getDimension();
  const blockVectorOptions = {
    includePassableBlocks: false,
    includeLiquidBlocks: false,
  };

  const bars = dimension.getBlockFromRay(
    test.worldLocation(new Location(0.5, 2, 1.5)),
    new Vector(1, 0, 0),
    blockVectorOptions
  );
  test.assert(
    bars.type == MinecraftBlockTypes.ironBars,
    "Expected to see through the banner and the water to the iron bars"
  );

  blockVectorOptions.includePassableBlocks = true;
  const banner = dimension.getBlockFromRay(
    test.worldLocation(new Location(0.5, 2, 1.5)),
    new Vector(1, 0, 0),
    blockVectorOptions
  );
  test.assert(banner.type == MinecraftBlockTypes.standingBanner, "Expected to see through the water to the iron bars");

  blockVectorOptions.includeLiquidBlocks = true;
  const water = dimension.getBlockFromRay(
    test.worldLocation(new Location(0.5, 2, 1.5)),
    new Vector(1, 0, 0),
    blockVectorOptions
  );
  test.assert(water.type == MinecraftBlockTypes.water, "Expected to see the water");

  test.succeed();
})
  .setupTicks(4) // time for water to convert from dynamic to static type
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "get_entity_from_vector", (test) => {
  let dimension = test.getDimension();

  test.spawnWithoutBehaviors("creeper", new BlockLocation(3, 2, 1));
  test.spawnWithoutBehaviors("creeper", new BlockLocation(2, 2, 1));

  // test both creepers are found
  const creepers = dimension.getEntitiesFromRay(test.worldLocation(new Location(0.5, 3.5, 1.5)), new Vector(1, 0, 0));
  test.assert(creepers.length == 2, "Expected to find 2 creepers");
  test.assertEntityInstancePresent(creepers[0], new BlockLocation(2, 2, 1));
  test.assertEntityInstancePresent(creepers[1], new BlockLocation(3, 2, 1));

  // check the entities are sorted by distance
  const creepersReversed = dimension.getEntitiesFromRay(
    test.worldLocation(new Location(5.5, 2.5, 1.5)),
    new Vector(-1, 0, 0)
  );
  test.assert(creepersReversed.length == 2, "Expected to find 2 creepers");
  test.assertEntityInstancePresent(creepersReversed[0], new BlockLocation(3, 2, 1));
  test.assertEntityInstancePresent(creepersReversed[1], new BlockLocation(2, 2, 1));

  // test blocks stop the entity raycast
  const blockedCreepers = dimension.getEntitiesFromRay(
    test.worldLocation(new Location(5.5, 3.5, 1.5)),
    new Vector(-1, 0, 0)
  );
  test.assert(blockedCreepers.length == 0, "Expected the block to stop the raycast");

  test.succeed();
})
  .setupTicks(4) // time for water to convert from dynamic to static type
  .tag(GameTest.Tags.suiteDefault);
