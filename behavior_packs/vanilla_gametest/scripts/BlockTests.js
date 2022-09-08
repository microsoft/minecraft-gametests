import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  BlockProperties,
  Direction,
  world,
  Location,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TicksPerSecond = 20;
const FiveSecondsInTicks = 5 * TicksPerSecond;

const FALLING_SAND_TEMPLATE_NAME = "BlockTests:falling_sand_template";
const FALLING_SAND_STARTUP_TICKS = 1;
const FALLING_SAND_TIMEOUT_TICKS = 20;

const BLOCKS_THAT_POP_SAND = [
  [MinecraftBlockTypes.woodenSlab, MinecraftBlockTypes.air], //replace missing oakSlab() with woodenSlab()
  [MinecraftBlockTypes.chest, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.rail, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.stoneButton, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.woodenPressurePlate, MinecraftBlockTypes.stone], //replace missing OakPressurePlate() with woodenPressurePlate()
  [MinecraftBlockTypes.torch, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.soulSand, MinecraftBlockTypes.air],
];

const BLOCKS_REPLACED_BY_SAND = [
  MinecraftBlockTypes.water,
  MinecraftBlockTypes.air,
  MinecraftBlockTypes.tallgrass, //replace grass() with tallgrass(). It needs grass, not grass block, MinecraftBlockTypes.grass is actually grass block.
];

const BLOCKS_THAT_SUPPORT_SAND = [
  MinecraftBlockTypes.stone,
  MinecraftBlockTypes.fence, //replace missing oakFence() with fence()
  MinecraftBlockTypes.oakStairs,
  MinecraftBlockTypes.scaffolding,
];

function testThatFallingSandPopsIntoItem(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  const targetPos = new BlockLocation(1, 2, 1);

  test.succeedWhen(() => {
    test.assertEntityPresentInArea("minecraft:item", true);
    test.assertEntityPresent("minecraft:falling_block", targetPos, false);
  });
}

function testThatFallingSandReplaces(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  test.succeedWhenBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 2, 1), true);
}

function testThatFallingSandLandsOnTop(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  test.succeedWhenBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 3, 1), true);
}

///
// Concrete Tests
///
for (let i = 0; i < BLOCKS_THAT_POP_SAND.length; i++) {
  const topBlock = BLOCKS_THAT_POP_SAND[i][0];
  const bottomBlock = BLOCKS_THAT_POP_SAND[i][1];
  const testName = "blocktests.falling_sand_pops_on_" + topBlock.id;
  let tag = null;

  GameTest.register("BlockTests", testName, (test) => {
    if (topBlock.id == "minecraft:stone_button") {
      const buttonPermutation = MinecraftBlockTypes.stoneButton.createDefaultBlockPermutation();
      buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.north;
      test.setBlockPermutation(buttonPermutation, new BlockLocation(1, 2, 1));
    } else {
      test.setBlockType(topBlock, new BlockLocation(1, 2, 1));
    }
    test.setBlockType(bottomBlock, new BlockLocation(1, 1, 1));
    testThatFallingSandPopsIntoItem(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

for (const block of BLOCKS_REPLACED_BY_SAND) {
  const testName = "blocktests.falling_sand_replaces_" + block.id;

  GameTest.register("BlockTests", testName, (test) => {
    //SetBlock will fail if set a block to what it already is. Skip to call setblock() for test falling_sand_replaces_air because it's just air block in initial structure.
    if (block.id != "minecraft:air") {
      test.setBlockType(block, new BlockLocation(1, 2, 1));
    }
    testThatFallingSandReplaces(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

for (const block of BLOCKS_THAT_SUPPORT_SAND) {
  const testName = "blocktests.falling_sand_lands_on_" + block.id;
  let tag = null;

  GameTest.register("BlockTests", testName, (test) => {
    test.setBlockType(block, new BlockLocation(1, 2, 1));
    testThatFallingSandLandsOnTop(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

GameTest.register("BlockTests", "concrete_solidifies_in_shallow_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 3, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "concrete_solidifies_in_deep_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 4, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "concrete_solidifies_next_to_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 3, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "sand_fall_boats", (test) => {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "sand_fall_shulker", (test) => {
  const EntitySpawnType = "minecraft:shulker";
  const spawnPos = new BlockLocation(1, 2, 1);

  test.spawn(EntitySpawnType, spawnPos);
  testThatFallingSandPopsIntoItem(test);
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

///
// Turtle Egg Tests
///

GameTest.register("BlockTests", "turtle_eggs_survive_xp", (test) => {
  const xpOrb = "minecraft:xp_orb";
  const spawnPos = new BlockLocation(1, 3, 1);

  for (let i = 0; i < 8; i++) {
    test.spawn(xpOrb, spawnPos);
  }

  // Fail if the turtle egg dies
  test.failIf(() => {
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
  });

  // Succeed after 4 seconds
  test.startSequence().thenIdle(80).thenSucceed();
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "turtle_eggs_survive_item", (test) => {
  test.pressButton(new BlockLocation(2, 4, 0));

  // Fail if the turtle egg dies
  test.failIf(() => {
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
  });

  // Succeed after 4 seconds
  test.startSequence().thenIdle(80).thenSucceed();
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "turtle_eggs_squished_by_mob", (test) => {
  const zombieEntityType = "minecraft:husk";
  const zombiePosition = new BlockLocation(1, 5, 1);
  test.spawn(zombieEntityType, zombiePosition);
  test.succeedWhenBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
})
  .required(false)
  .maxTicks(TicksPerSecond * 20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "explosion_drop_location", (test) => {
  test.pressButton(new BlockLocation(4, 3, 4));

  test.succeedWhen(() => {
    const redSandstonePos = new BlockLocation(6, 2, 4);
    const sandstonePos = new BlockLocation(2, 2, 4);

    test.assertBlockPresent(MinecraftBlockTypes.redSandstone, redSandstonePos, false);
    test.assertBlockPresent(MinecraftBlockTypes.sandstone, sandstonePos, false);
    test.assertItemEntityPresent(MinecraftItemTypes.redSandstone, redSandstonePos, 2.0, true);
    test.assertItemEntityPresent(MinecraftItemTypes.sandstone, sandstonePos, 2.0, true);
  });
})
  .maxTicks(TicksPerSecond * 10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled) //redSandstone and sandstone items should be present.
  .maxAttempts(3);

GameTest.register("BlockTests", "concrete_pops_off_waterlogged_chest", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 4, 1));
  test.succeedWhen(() => {
    const chestPos = new BlockLocation(1, 2, 1);
    test.assertBlockPresent(MinecraftBlockTypes.chest, chestPos, true);
    test.assertItemEntityPresent(MinecraftItemTypes.concretePowder, chestPos, 2, true);
    test.assertEntityPresentInArea("falling_block", false);
  });
})
  .maxTicks(TicksPerSecond * 5)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "waterlogged_slab", (test) => {
  const slabPos = new BlockLocation(1, 1, 1);
  test.assertIsWaterlogged(slabPos, false);
  test.succeedWhen(() => {
    test.assertIsWaterlogged(slabPos, true);
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled) // Slab should be waterlogged
  .maxTicks(TicksPerSecond * 2);

GameTest.register("BlockTests", "dispenser_light_candles", (test) => {
  const testEx = new GameTestExtensions(test);
  test.pressButton(new BlockLocation(1, 3, 0));
  test.pressButton(new BlockLocation(1, 3, 2));

  test.succeedWhen(() => {
    testEx.assertBlockProperty("lit", 1, new BlockLocation(0, 2, 0));
    testEx.assertBlockProperty("lit", 1, new BlockLocation(0, 2, 2));
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "put_out_candles", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const testEx = new GameTestExtensions(test);
  const candlePos = new BlockLocation(0, 2, 0);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.interactWithBlock(candlePos);
    })
    .thenWait(() => {
      testEx.assertBlockProperty("lit", 0, candlePos);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

///
// Big Dripleaf Tests
///
const platformStructure = "ComponentTests:platform";

GameTest.register("BlockTests", "dripleaf_player_fall", (test) => {
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 1));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 4, 1));
  test
    .startSequence()
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 2, 1), true))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "dripleaf_walk_across", (test) => {
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 0));
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 1));
  test.setBlockType(MinecraftBlockTypes.smoothStone, new BlockLocation(1, 2, 2));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 4, 0));
  test
    .startSequence()
    .thenExecuteAfter(10, () => test.assertEntityPresent("player", new BlockLocation(1, 3, 2), false))
    .thenExecute(() => playerSim.moveToLocation(new Location(1, 3, 2.5)))
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 3, 2)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

///
// Powder snow tests
///

GameTest.register("BlockTests", "powder_snow_player_sink_and_freeze", (test) => {
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 1));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 3, 1));
  let healthComp = playerSim.getComponent("health");
  test
    .startSequence()
    .thenExecuteAfter(180, () => test.assert(healthComp.current < healthComp.value, "no damage"))
    .thenExecute(() => test.assertEntityInstancePresent(playerSim, new BlockLocation(1, 2, 1)))
    .thenSucceed();
})
  .maxTicks(200)
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "powder_snow_leather_boots_walk", (test) => {
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 0));
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 1));
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 2));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_snow");
  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      playerSim.dimension.runCommand("replaceitem entity playerSim_snow slot.armor.feet 0 leather_boots");
    })
    .thenExecuteAfter(10, () => playerSim.moveToLocation(new Location(1, 3, 2.5)))
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 4, 2)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

///
// Candle cake tests
///

GameTest.register("BlockTests", "player_light_birthday_cake_candle", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0), "playerSim_cake");
  test.setBlockType(MinecraftBlockTypes.cake, new BlockLocation(1, 2, 1));
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()
    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.candle, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithBlock(new BlockLocation(1, 2, 1), Direction.up), ""))
    .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.flintAndSteel, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithBlock(new BlockLocation(1, 2, 1), Direction.up), ""))
    .thenExecute(() => testEx.assertBlockProperty("lit", 1, new BlockLocation(1, 2, 1)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);
