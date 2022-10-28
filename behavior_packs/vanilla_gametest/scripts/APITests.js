// Copyright (c) Microsoft Corporation.  All rights reserved.

import GameTestExtensions from "./GameTestExtensions.js";
import * as GameTest from "@minecraft/server-gametest";
import {
  BlockLocation,
  BlockProperties,
  MinecraftBlockTypes,
  Color,
  Direction,
  ExplosionOptions,
  EntityDamageCause,
  EntityEventOptions,
  EntityDataDrivenTriggerEventOptions,
  FluidContainer,
  FluidType,
  MinecraftEffectTypes,
  MinecraftItemTypes,
  ItemStack,
  Location,
  Vector,
  world,
} from "@minecraft/server";

GameTest.register("APITests", "on_entity_created", (test) => {
  const entityCreatedCallback = world.events.entityCreate.subscribe((entity) => {
    if (entity) {
      test.succeed();
    } else {
      test.fail("Expected entity");
    }
  });
  test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  world.events.entityCreate.unsubscribe(entityCreatedCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_is_waterlogged", (test) => {
  const waterChestLoc = new BlockLocation(5, 2, 1);
  const waterLoc = new BlockLocation(4, 2, 1);
  const chestLoc = new BlockLocation(2, 2, 1);
  const airLoc = new BlockLocation(1, 2, 1);

  test.assertIsWaterlogged(waterChestLoc, true);
  test.assertIsWaterlogged(waterLoc, false);
  test.assertIsWaterlogged(chestLoc, false);
  test.assertIsWaterlogged(airLoc, false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_redstone_power", (test) => {
  const redstoneBlockLoc = new BlockLocation(3, 2, 1);
  const redstoneTorchLoc = new BlockLocation(2, 2, 1);
  const poweredLampLoc = new BlockLocation(1, 2, 1);
  const unpoweredLampLoc = new BlockLocation(0, 2, 1);
  const airLoc = new BlockLocation(3, 2, 0);
  const redstoneWireLoc = new BlockLocation(0, 1, 0);

  test.succeedWhen(() => {
    test.assertRedstonePower(redstoneBlockLoc, 15);
    test.assertRedstonePower(redstoneTorchLoc, 15);
    test.assertRedstonePower(poweredLampLoc, 15);
    test.assertRedstonePower(unpoweredLampLoc, 0);
    test.assertRedstonePower(airLoc, -1);
    test.assertRedstonePower(redstoneWireLoc, 13); // 3 length wire
  });
})
  .maxTicks(20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_item", (test) => {
  const featherItem = new ItemStack(MinecraftItemTypes.feather, 1, 0);
  test.spawnItem(featherItem, new Location(1.5, 3.5, 1.5));
  test.succeedWhen(() => {
    test.assertEntityPresent("minecraft:item", new BlockLocation(1, 2, 1), true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_data", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, pigLoc);
  test.succeedWhen(() => {
    test.assertEntityState(pigLoc, pigId, (entity) => entity.id !== undefined);
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "add_effect", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villagerLoc = new BlockLocation(1, 2, 1);
  const villager = test.spawn(villagerId, villagerLoc);
  const duration = 20;
  villager.addEffect(MinecraftEffectTypes.poison, duration, 1);

  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).duration == duration
  );
  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).amplifier == 1
  );

  test.runAfterDelay(duration, () => {
    test.assertEntityState(
      villagerLoc,
      villagerId,
      (entity) => entity.getEffect(MinecraftEffectTypes.poison) === undefined
    );
    test.succeed();
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_present", (test) => {
  const villagerId = "minecraft:villager_v2";
  const villagerLoc = new BlockLocation(1, 2, 3);
  const emeraldItem = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const emeraldItemLoc = new BlockLocation(3, 2, 3);
  const minecartId = "minecraft:minecart";
  const minecartLoc = new BlockLocation(3, 2, 1);
  const armorStandId = "minecraft:armor_stand";
  const armorStandLoc = new BlockLocation(1, 2, 1);

  test.spawn(villagerId, villagerLoc);
  test.spawnItem(emeraldItem, new Location(3.5, 4.5, 3.5));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerId, villagerLoc, true);
    test.assertItemEntityPresent(MinecraftItemTypes.emerald, emeraldItemLoc, 0, true);
    test.assertEntityPresent(armorStandId, armorStandLoc, true);

    // Check all blocks surrounding the minecart
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        let offsetLoc = new BlockLocation(minecartLoc.x + x, minecartLoc.y, minecartLoc.z + z);
        if (x == 0 && z == 0) {
          test.assertEntityPresent(minecartId, offsetLoc, true);
        } else {
          test.assertEntityPresent(minecartId, offsetLoc, false);
        }
      }
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_not_present", (test) => {
  const armorStandId = "minecraft:armor_stand";
  const pigId = "minecraft:pig";
  const armorStandLoc = new BlockLocation(1, 2, 1);
  const airLoc = new BlockLocation(0, 2, 1);

  try {
    test.assertEntityPresentInArea(armorStandId, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  try {
    test.assertEntityPresent(armorStandId, armorStandLoc, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  test.assertEntityPresent(armorStandId, airLoc, false);
  test.assertEntityPresentInArea(pigId, false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_item_entity_count_is", (test) => {
  let oneItemLoc = new BlockLocation(3, 2, 1);
  let fiveItemsLoc = new BlockLocation(1, 2, 1);
  let noItemsLoc = new BlockLocation(2, 2, 1);
  let diamondPickaxeLoc = new BlockLocation(2, 2, 4);

  const oneEmerald = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const onePickaxe = new ItemStack(MinecraftItemTypes.diamondPickaxe, 1, 0);
  const fiveEmeralds = new ItemStack(MinecraftItemTypes.emerald, 5, 0);

  test.spawnItem(oneEmerald, new Location(3.5, 3, 1.5));
  test.spawnItem(fiveEmeralds, new Location(1.5, 3, 1.5));

  // spawn 9 pickaxes in a 3x3 grid
  for (let x = 1.5; x <= 3.5; x++) {
    for (let z = 3.5; z <= 5.5; z++) {
      test.spawnItem(onePickaxe, new Location(x, 3, z));
    }
  }

  test.assertItemEntityCountIs(MinecraftItemTypes.emerald, noItemsLoc, 0, 0);

  test.succeedWhen(() => {
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, oneItemLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, oneItemLoc, 0, 1);
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, fiveItemsLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 1, 9);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 0, 1);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_touching", (test) => {
  const armorStandId = "minecraft:armor_stand";

  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.5, 3.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(2.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.0), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 2.0), false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "pulse_redstone", (test) => {
  const pulseLoc = new BlockLocation(1, 2, 2);
  const lampLoc = new BlockLocation(1, 2, 1);
  test.assertRedstonePower(lampLoc, 0);
  test.pulseRedstone(pulseLoc, 2);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 15))
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 0))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "block_location", (test) => {
  let testLoc = new BlockLocation(1, 1, 1);
  let worldLoc = test.worldBlockLocation(testLoc);
  let relativeLoc = test.relativeBlockLocation(worldLoc);
  test.assert(!relativeLoc.equals(worldLoc), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.equals(testLoc), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "location", (test) => {
  let testLoc = new Location(1.2, 1.2, 1.2);
  let worldLoc = test.worldLocation(testLoc);
  let relativeLoc = test.relativeLocation(worldLoc);
  test.assert(!relativeLoc.isNear(worldLoc, 0.01), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.isNear(testLoc, 0.01), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_basic", (test) => {
  const center = new BlockLocation(2, 3, 2);

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  test.getDimension().createExplosion(explosionLoc, 10);

  for (let x = 1; x <= 3; x++) {
    for (let y = 2; y <= 4; y++) {
      for (let z = 1; z <= 3; z++) {
        test.assertBlockPresent(MinecraftBlockTypes.cobblestone, new BlockLocation(x, y, z), false);
      }
    }
  }

  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_advanced", (test) => {
  const dimension = test.getDimension();
  const center = new BlockLocation(3, 3, 3);

  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(3, 4, 3);
  test.spawn(pigId, pigLoc);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  let explosionOptions = {};

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Start by exploding without breaking blocks
  explosionOptions.breaksBlocks = false;
  const creeper = test.spawn("minecraft:creeper", new BlockLocation(1, 2, 1));
  explosionOptions.source = creeper;
  test.assertEntityPresent(pigId, pigLoc, true);
  dimension.createExplosion(explosionLoc, 10, explosionOptions);
  creeper.kill();
  test.assertEntityPresent(pigId, pigLoc, false);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Next, explode with fire
  explosionOptions = {};
  explosionOptions.causesFire = true;

  let findFire = () => {
    let foundFire = false;
    for (let x = 0; x <= 6; x++) {
      for (let z = 0; z <= 6; z++) {
        try {
          test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(x, 3, z), true);
          foundFire = true;
          break;
        } catch (e) {}
      }
    }
    return foundFire;
  };

  test.assert(!findFire(), "Unexpected fire");
  dimension.createExplosion(explosionLoc, 15, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, false);
  test.assert(findFire(), "No fire found");

  // Finally, explode in water
  explosionOptions.allowUnderwater = true;
  const belowWaterLoc = new BlockLocation(3, 1, 3);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, false);
  dimension.createExplosion(explosionLoc, 10, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, true);
  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "triggerEvent", (test) => {
  const creeper = test.spawn("creeper", new BlockLocation(1, 2, 1));
  creeper.triggerEvent("minecraft:start_exploding_forced");

  test.succeedWhen(() => {
    test.assertEntityPresentInArea("creeper", false);
  });
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "chat", (test) => {
  test.print("subscribing");

  const chatCallback = world.events.beforeChat.subscribe((eventData) => {
    if (eventData.message === "!killme") {
      eventData.sender.kill();
      eventData.cancel = true;
    } else if (eventData.message === "!players") {
      test.print(`There are ${eventData.targets.length} players in the server.`);
      for (const target of eventData.targets) {
        test.print("Player: " + target.name);
      }
    } else {
      eventData.message = `Modified '${eventData.message}'`;
    }
  });

  test
    .startSequence()
    .thenIdle(200)
    .thenExecute(() => {
      world.events.beforeChat.unsubscribe(chatCallback);
      test.print("unsubscribed");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .maxTicks(1000)
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("APITests", "add_effect_event", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager = test.spawn(villagerId, new BlockLocation(1, 2, 1));

  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pig = test.spawn(pigId, new BlockLocation(1, 2, 1));

  let basicEffectSucceed = false;
  let filteredEntityEffectSucceed = false;
  let filteredTypeEffectSucceed = false;

  const effectAddCallback = world.events.effectAdd.subscribe((eventData) => {
    if (eventData.entity.id === "minecraft:villager_v2") {
      test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
      test.assert(eventData.effectState === 1, "Unexpected effect state");
      basicEffectSucceed = true;
      if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
    }
  });

  let specificEntityOptions = new EntityEventOptions();
  specificEntityOptions.entities.push(villager);

  const effectEntityFilterAddCallback = world.events.effectAdd.subscribe((eventData) => {
    test.assert(eventData.entity.id === "minecraft:villager_v2", "Unexpected id");
    test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
    test.assert(eventData.effectState === 1, "Unexpected effect state");
    filteredEntityEffectSucceed = true;
    if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
  }, specificEntityOptions);

  let entityTypeOptions = new EntityEventOptions();
  entityTypeOptions.entityTypes.push("minecraft:villager_v2");

  const effectTypeFilterAddCallback = world.events.effectAdd.subscribe((eventData) => {
    test.assert(eventData.entity.id === "minecraft:villager_v2", "Unexpected id");
    test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
    test.assert(eventData.effectState === 1, "Unexpected effect state");
    filteredTypeEffectSucceed = true;
    if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
  }, entityTypeOptions);

  villager.addEffect(MinecraftEffectTypes.poison, 5, 1);
  pig.addEffect(MinecraftEffectTypes.poison, 5, 1);
  world.events.effectAdd.unsubscribe(effectAddCallback);
  world.events.effectAdd.unsubscribe(effectEntityFilterAddCallback);
  world.events.effectAdd.unsubscribe(effectTypeFilterAddCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston", (test) => {
  const dimension = test.getDimension();
  const pistonLoc = new BlockLocation(1, 2, 1);
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonComp = test.getDimension().getBlock(test.worldBlockLocation(pistonLoc)).getComponent("piston");

  test.assert(pistonComp != undefined, "Expected piston component");

  let assertPistonState = (isMoving, isExpanded, isExpanding, isRetracted, isRetracting) => {
    test.assert(
      pistonComp.isMoving === isMoving,
      `Unexpected isMoving, expected[${isMoving}] actual[${pistonComp.isMoving}]`
    );
    test.assert(
      pistonComp.isExpanded === isExpanded,
      `Unexpected isExpanded, expected[${isExpanded}] actual[${pistonComp.isExpanded}]`
    );
    test.assert(
      pistonComp.isExpanding === isExpanding,
      `Unexpected isExpanding, expected[${isExpanding}] actual[${pistonComp.isExpanding}]`
    );
    test.assert(
      pistonComp.isRetracted === isRetracted,
      `Unexpected isRetracted, expected[${isRetracted}] actual[${pistonComp.isRetracted}]`
    );
    test.assert(
      pistonComp.isRetracting === isRetracting,
      `Unexpected isRetracting, expected[${isRetracting}] actual[${pistonComp.isRetracting}]`
    );
  };

  test
    .startSequence()
    .thenExecute(() => {
      test.assert(pistonComp.attachedBlocks.length === 0, "Expected 0 attached blocks");
      assertPistonState(false, false, false, true, false); // isRetracted
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, redstoneLoc);
    })
    .thenIdle(3)
    .thenExecute(() => {
      test.assert(
        pistonComp.attachedBlocks.length === 3,
        `Expected 3 attached blocks, actual [${pistonComp.attachedBlocks.length}]`
      );
      assertPistonState(true, false, true, false, false); // isMoving, isExpanding
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, true, false, false, false); // isExpanded
      test.setBlockType(MinecraftBlockTypes.air, redstoneLoc);
    })
    .thenIdle(3)
    .thenExecute(() => {
      assertPistonState(true, false, false, false, true); // isMoving, isRetracting
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, false, false, true, false); // isRetracted
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event", (test) => {
  let expanded = false;
  let retracted = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = world.events.pistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      if (pistonEvent.isExpanding) {
        expanded = true;
      } else {
        retracted = true;
      }
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, planksLoc, true);
      test.assert(expanded, "Expected piston expanding event");
      test.assert(retracted, "Expected piston retracting event");
      world.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event_canceled", (test) => {
  let canceled = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = world.events.beforePistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      pistonEvent.cancel = true;
      canceled = true;
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assert(canceled, "Expected canceled beforePistonActivate event");
      test.assertBlockPresent(MinecraftBlockTypes.planks, planksLoc, true);
      world.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let leverPower = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(!leverEvent.player, "Expected player object to be empty");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    leverPower = leverEvent.isPowered;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  await test.idle(5);
  test.pullLever(leverLoc);
  world.events.leverActivate.unsubscribe(leverCallback);
  test.assert(leverPower, "Expected lever power");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event_multiple_toggles", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let leverPower = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(!leverEvent.player, "Expected player object to be empty");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    leverPower = leverEvent.isPowered;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  await test.idle(5);
  test.pullLever(leverLoc);
  test.assert(leverPower, "Expected lever power");
  test.pullLever(leverLoc);
  test.assert(!leverPower, "Expected no lever power");
  world.events.leverActivate.unsubscribe(leverCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event_player", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let eventPlayer;
  let testSucceed = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    eventPlayer = leverEvent.player;
    test.assert(eventPlayer == simulatedPlayer, "incorrect player found");
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    test.assert(eventPlayer.name === "Lever_Toggle_Player", "Lever event's player name does not match expected");
    testSucceed = true;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  const simulatedPlayer = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 1), "Lever_Toggle_Player");
  await test.idle(5);
  simulatedPlayer.interactWithBlock(leverLoc);
  world.events.leverActivate.unsubscribe(leverCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc)) {
      test.assert(buttonEvent.source === undefined, "Script source should be null");
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  test.setBlockPermutation(buttonPermutation, buttonLoc);
  test.pressButton(buttonLoc);
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event_player", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let eventPlayer = buttonEvent.source;
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc) && eventPlayer == simulatedPlayer) {
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(eventPlayer.name === "Button_Push_Player", "Button event's player name does not match expected");
      test.assert(buttonEvent.source === eventPlayer, "Button event's source does not match expected");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  const simulatedPlayer = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 1), "Button_Push_Player");
  await test.idle(5);
  test.setBlockPermutation(buttonPermutation, buttonLoc);
  simulatedPlayer.interactWithBlock(buttonLoc);
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event_projectile", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;
  let spawnedArrow;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc)) {
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(buttonEvent.source === spawnedArrow, "Expected arrow source type");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  test.setBlockPermutation(buttonPermutation, buttonLoc);
  spawnedArrow = test.spawnAtLocation("minecraft:arrow", new Location(1.5, 2.5, 1.5));
  await test.idle(20); //give the arrow time to fall
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "sneaking", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  const pig = test.spawn(pigId, pigLoc);
  pig.isSneaking = true;
  test
    .startSequence()
    .thenExecuteAfter(120, () => {
      test.assertEntityPresent(pigId, pigLoc, true);
    })
    .thenSucceed();
})
  .maxTicks(130)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_can_reach_location", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager1 = test.spawn(villagerId, new BlockLocation(1, 2, 1));
  const villager2 = test.spawn(villagerId, new BlockLocation(1, 2, 3));
  const villager3 = test.spawn(villagerId, new BlockLocation(1, 2, 5));
  test.assertCanReachLocation(villager1, new BlockLocation(4, 2, 1), true);
  test.assertCanReachLocation(villager2, new BlockLocation(4, 2, 3), false);
  test.assertCanReachLocation(villager3, new BlockLocation(4, 2, 5), false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

const isLocationInTest = (test, worldLoc) => {
  const size = 4;
  let loc = test.relativeBlockLocation(worldLoc);
  return loc.x >= 0 && loc.y >= 0 && loc.z >= 0 && loc.x < size && loc.y < size && loc.z < size;
};

GameTest.register("APITests", "explosion_event", (test) => {
  let exploded = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);
  const polishedAndesiteLoc = new BlockLocation(1, 1, 1);

  const beforeExplosionCallback = world.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
    explosionEvent.impactedBlocks = [test.worldBlockLocation(cobblestoneLoc)];
  });

  const explosionCallback = world.events.explosion.subscribe((explosionEvent) => {
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 1, "Unexpected number of impacted blocks");
    exploded = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(exploded, "Expected explosion event");
      test.assertBlockPresent(MinecraftBlockTypes.stone, polishedAndesiteLoc, true);
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, false);
      world.events.beforeExplosion.unsubscribe(beforeExplosionCallback);
      world.events.explosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explosion_event_canceled", (test) => {
  let canceled = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const explosionCallback = world.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    explosionEvent.cancel = true;
    canceled = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(canceled, "Expected canceled beforeExplosionEvent event");
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
      world.events.beforeExplosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explode_block_event", (test) => {
  let explodedCount = 0;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const blockExplodeCallback = world.events.blockExplode.subscribe((blockExplodeEvent) => {
    if (!isLocationInTest(test, blockExplodeEvent.block.location)) return;
    test.assert(blockExplodeEvent.source !== undefined, "Expected source");
    explodedCount++;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(explodedCount === 10, "Unexpected number of exploded blocks");
      world.events.blockExplode.unsubscribe(blockExplodeCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "connectivity", (test) => {
  const centerLoc = new BlockLocation(1, 2, 1);

  let connectivity = test.getFenceConnectivity(centerLoc);

  test.assert(!connectivity.north, "The stair is not oriented the right way to connect");
  test.assert(connectivity.east, "Should connect to another fence");
  test.assert(connectivity.south, "Should connect to another fence");
  test.assert(connectivity.west, "Should connect to the back of the stairs");

  test.succeed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_at_location", (test) => {
  const spawnLoc = new Location(1.3, 2, 1.3);
  const chicken = test.spawnAtLocation("chicken", spawnLoc);

  test
    .startSequence()
    .thenExecute(() => {
      const chickenLoc = chicken.location;
      const relativeChickenLoc = test.relativeLocation(chickenLoc);
      test.assert(relativeChickenLoc.isNear(spawnLoc, 0.01), "Unexpected spawn location");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:animal_pen")
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "walk_to_location", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const chicken = test.spawnWithoutBehaviors("chicken", spawnLoc);

  const targetLoc = new Location(2.2, 2, 3.2);
  test.walkToLocation(chicken, targetLoc, 1);

  test.succeedWhen(() => {
    const chickenLoc = chicken.location;
    const relativeChickenLoc = test.relativeLocation(chickenLoc);
    // Mobs will stop navigating as soon as they intersect the target location
    test.assert(relativeChickenLoc.isNear(targetLoc, 0.65), "Chicken did not reach the target location");
  });
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "walk_to_location_far", (test) => {
  const targetLoc = new BlockLocation(3, 2, 17);
  const zombie = test.spawnWithoutBehaviors("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test.walkTo(zombie, targetLoc);
  test.succeedWhen(() => {
    test.assertRedstonePower(targetLoc, 15);
  });
})
  .maxTicks(400)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spread_from_face_toward_direction", (test) => {
  const testEx = new GameTestExtensions(test);

  let multifaceLoc = new BlockLocation(1, 4, 0);
  let spreadLoc = new BlockLocation(1, 3, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  glowLichenPermutation.getProperty(BlockProperties.multiFaceDirectionBits).value =
    1 << testEx.getMultiFaceDirection(test.getTestDirection());
  test.setBlockPermutation(glowLichenPermutation, multifaceLoc);

  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, multifaceLoc, true);
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, false);

  test.spreadFromFaceTowardDirection(multifaceLoc, test.getTestDirection(), Direction.down);
  test
    .startSequence()
    .thenExecuteAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "rotate_direction", (test) => {
  test.assert(
    test.rotateDirection(Direction.south) == test.getTestDirection(),
    "Expected rotated south direction to match test direction"
  );

  switch (test.getTestDirection()) {
    case Direction.north:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.south,
        "Unexpected rotated direction for Direction.north with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.west,
        "Unexpected rotated direction for Direction.east with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.north,
        "Unexpected rotated direction for Direction.south with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.east,
        "Unexpected rotated direction for Direction.west with testDirection Direction.north"
      );
      break;
    case Direction.east:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.west,
        "Unexpected rotated direction for Direction.north with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.north,
        "Unexpected rotated direction for Direction.east with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.east,
        "Unexpected rotated direction for Direction.south with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.south,
        "Unexpected rotated direction for Direction.west with testDirection Direction.east"
      );
      break;
    case Direction.south:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.north,
        "Unexpected rotated direction for Direction.north with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.east,
        "Unexpected rotated direction for Direction.east with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.south,
        "Unexpected rotated direction for Direction.south with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.west,
        "Unexpected rotated direction for Direction.west with testDirection Direction.south"
      );
      break;
    case Direction.west:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.east,
        "Unexpected rotated direction for Direction.north with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.south,
        "Unexpected rotated direction for Direction.east with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.west,
        "Unexpected rotated direction for Direction.south with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.north,
        "Unexpected rotated direction for Direction.west with testDirection Direction.west"
      );
      break;
    default:
      test.assert(false, "Invalid test direction");
  }

  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.stoneButton.createDefaultBlockPermutation();
  buttonPermutation.getProperty(BlockProperties.facingDirection).value = test.rotateDirection(Direction.north);
  test.setBlockPermutation(buttonPermutation, buttonLoc);

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stoneButton, buttonLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

function isNear(a, b, epsilon = 0.001) {
  return Math.abs(a - b) < epsilon;
}

function isNearVec(a, b, epsilon = 0.001) {
  return Vector.distance(a, b) < epsilon;
}

GameTest.register("APITests", "cauldron", (test) => {
  const loc = new BlockLocation(0, 1, 0);
  var block = test.getBlock(loc);

  test.setFluidContainer(loc, FluidType.water);
  test.assert(block.getComponent("waterContainer") != null, "This is a water container");
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A water container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A water container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A water container should not have a potionContainer component"
  );

  block.getComponent("waterContainer").fillLevel = FluidContainer.maxFillLevel;
  test.assert(
    block.getComponent("waterContainer").fillLevel == FluidContainer.maxFillLevel,
    "The fill level should match with what it was set to"
  );

  block.getComponent("waterContainer").customColor = new Color(1, 0, 0, 1);
  test.assert(block.getComponent("waterContainer").customColor.red == 1, "red component should be set");
  test.assert(block.getComponent("waterContainer").customColor.green == 0, "green component should be set");
  test.assert(block.getComponent("waterContainer").customColor.blue == 0, "blue component should be set");

  block.getComponent("waterContainer").addDye(MinecraftItemTypes.blueDye);
  test.assert(isNear(block.getComponent("waterContainer").customColor.red, 0.616), "red component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.green, 0.133), "green component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.blue, 0.333), "blue component should be set");

  test.setFluidContainer(loc, FluidType.lava);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A lava container should not have a waterContainer component"
  );
  test.assert(block.getComponent("lavaContainer") != null, "This is a lava component");
  test.assert(
    block.getComponent("snowContainer") == null,
    "A lava container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A lava container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, FluidType.powderSnow);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A snow container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A snow container should not have a lavaContainer component"
  );
  test.assert(block.getComponent("snowContainer") != null, "This is a snow container");
  test.assert(
    block.getComponent("potionContainer") == null,
    "A snow container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, FluidType.potion);
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A potion container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a snowContainer component"
  );
  test.assert(block.getComponent("potionContainer") != null, "This is a potion container");

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

// test for bug: 678331
GameTest.register("APITests", "cauldron_nocrash", (test) => {
  const loc = new BlockLocation(0, 1, 0);
  var block = test.getBlock(loc);

  test.setBlockType(MinecraftBlockTypes.air, loc);
  test.setBlockType(MinecraftBlockTypes.cauldron, loc);
  test.setFluidContainer(loc, FluidType.potion);

  let cauldron = block.getComponent("potionContainer");
  cauldron.fillLevel = 2;

  const poisonPotion = new ItemStack(MinecraftItemTypes.splashPotion, 1, 32);
  cauldron.setPotionType(poisonPotion); //this line crashes the title

  test.succeed();
})
  .structureName("APITests:cauldron")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "jukebox", (test) => {
  var jukeboxBlock = test.getBlock(new BlockLocation(0, 1, 0));
  var musicPlayerComp = jukeboxBlock.getComponent("recordPlayer");

  try {
    musicPlayerComp.setRecord(MinecraftItemTypes.apple);
    test.fail("An exception should be thrown when playing an item that is not a music disk");
  } catch (e) {}

  test.assert(musicPlayerComp.isPlaying() === false, "Should be stopped");
  musicPlayerComp.setRecord(MinecraftItemTypes.musicDiscMellohi);
  test.assert(musicPlayerComp.isPlaying() === true, "Should be playing");

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assert(musicPlayerComp.isPlaying() === true, "Disk should not be finished yet");
      musicPlayerComp.clearRecord();
      test.assert(musicPlayerComp.isPlaying() === false, "Disk should be stopped now");
    })
    .thenSucceed();
})
  .maxTicks(25)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "maybe_fill_cauldron", (test) => {
  test
    .startSequence()
    .thenExecute(() => {
      test.triggerInternalBlockEvent(new BlockLocation(1, 3, 1), "minecraft:drip");
      test.triggerInternalBlockEvent(new BlockLocation(3, 3, 1), "minecraft:drip");
    })
    .thenIdle(61)
    .thenExecute(() => {
      var waterCauldron = test.getBlock(new BlockLocation(3, 2, 1));
      var lavaCauldron = test.getBlock(new BlockLocation(1, 2, 1));
      test.assert(
        waterCauldron.getComponent("waterContainer").fillLevel == 2,
        "Expected water to be at level 2, but got " + waterCauldron.getComponent("waterContainer").fillLevel
      );
      test.assert(
        lavaCauldron.getComponent("lavaContainer").fillLevel == FluidContainer.maxFillLevel,
        "Expected lava to be full, but got a fill level of " + lavaCauldron.getComponent("lavaContainer").fillLevel
      );
    })
    .thenSucceed();
})
  .setupTicks(30) // time it takes lava to flow.
  .maxTicks(100)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "grow_pointed_dripstone", (test) => {
  test.triggerInternalBlockEvent(new BlockLocation(1, 5, 1), "grow_stalagtite");
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), false);

  test.triggerInternalBlockEvent(new BlockLocation(1, 5, 1), "grow_stalagmite");
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), true);

  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 3, 1), false);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "vines", (test) => {
  const testEx = new GameTestExtensions(test);

  const allBitmask = 15;
  const northBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.north));
  const eastBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.east));
  const southBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.south));
  const westBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.west));

  test.triggerInternalBlockEvent(new BlockLocation(1, 4, 2), "grow_down", [southBitmask | northBitmask]);
  testEx.assertBlockProperty(
    BlockProperties.vineDirectionBits,
    southBitmask | northBitmask,
    new BlockLocation(1, 3, 2)
  );

  test.triggerInternalBlockEvent(new BlockLocation(1, 4, 2), "grow_up", [allBitmask]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask | eastBitmask, new BlockLocation(1, 5, 2));

  test.triggerInternalBlockEvent(new BlockLocation(7, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.west)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask, new BlockLocation(6, 2, 1));

  test.triggerInternalBlockEvent(new BlockLocation(6, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.west)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask | westBitmask, new BlockLocation(6, 2, 1));

  test.triggerInternalBlockEvent(new BlockLocation(7, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.east)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, westBitmask, new BlockLocation(8, 2, 2));

  test.succeed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "tags", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "tag_player");
  const dimension = test.getDimension();

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      dimension.runCommandAsync("tag @p[name=tag_player] add test_tag_1");
      test.assert(player.hasTag("test_tag_1"), "Expected tag test_tag_1");
      test.assert(!player.hasTag("test_tag_2"), "Did not expect tag test_tag_2");
      test.assert(player.removeTag("test_tag_1"), "Expected successful tag removal");
      test.assert(!player.removeTag("test_tag_1"), "Expected failed tag removal");
      test.assert(!player.hasTag("test_tag_1"), "Did not expect tag test_tag_1");
      player.addTag("test_tag_2");
      test.assert(player.hasTag("test_tag_2"), "Expected tag test_tag_2");
      let tags = player.getTags();
      test.assert(tags.length === 1 && tags[0] === "test_tag_2", "Unexpected tags value");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

//AI tests
GameTest.register("APITests", "cant_set_target", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let wolf = test.spawn("minecraft:wolf<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));

  await test.idle(10);
  try {
    wolf.target = player;
    test.fail("Target should be a read-only property");
  } catch (e) {
    test.succeed();
  }

  wolf.kill();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "can_get_null_target", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let wolf = test.spawn("minecraft:wolf<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));

  const target = wolf.target;
  if (target) {
    test.fail("Expected wolf to not have a target");
  }

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

//Entity Teleport Tests
GameTest.register("APITests", "teleport_mob", async (test) => {
  let sheepSpawn = new BlockLocation(0, 2, 0);
  let teleportBlockLoc = new BlockLocation(2, 2, 2);
  let sheep = test.spawn("minecraft:sheep", sheepSpawn);
  let teleportLoc = new Location(2, 2, 2);
  let teleportWorldLoc = test.worldLocation(teleportLoc);

  await test.idle(10);
  sheep.teleport(teleportWorldLoc, sheep.dimension, 0.0, 0.0);
  test.assertEntityPresent("minecraft:sheep", teleportBlockLoc, true);
  sheep.kill();
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "teleport_mob_facing", async (test) => {
  let playerSpawn = new BlockLocation(0, 2, 0);
  let player = test.spawnSimulatedPlayer(playerSpawn, "simulatedPlayer");
  let teleportLoc = new Location(2, 2, 2);
  let teleportBlockLoc = new BlockLocation(2, 2, 2);
  let teleportWorldLoc = test.worldLocation(teleportLoc);

  let facingLoc = new Location(2, 3, 0);
  let facingBlockLoc = new BlockLocation(2, 3, 0);
  let facingWorldLoc = test.worldLocation(facingLoc);

  test.setBlockType(MinecraftBlockTypes.diamondBlock, facingBlockLoc);
  const diamondBlock = test.getBlock(facingBlockLoc);
  let facingBlock;

  await test.idle(10);
  player.teleportFacing(teleportWorldLoc, player.dimension, facingWorldLoc);
  await test.idle(20);
  facingBlock = player.getBlockFromViewVector();
  test.assert(
    facingBlock.type === diamondBlock.type,
    "expected mob to face diamond block but instead got " + facingBlock.type.id
  );
  test.assertEntityPresent("minecraft:player", teleportBlockLoc, true);
  player.kill();
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "view_vector", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const playerName = "Test Player";
  const player = test.spawnSimulatedPlayer(spawnLoc, playerName);

  player.lookAtBlock(new BlockLocation(0, 3, 1));
  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      test.assert(
        isNear(player.viewVector.x, -0.99, 0.01),
        "Expected x component to be -0.99, but got " + player.viewVector.x
      );
      test.assert(
        isNear(player.viewVector.y, -0.12, 0.01),
        "Expected y component to be -0.12, but got " + player.viewVector.y
      );
      test.assert(isNear(player.viewVector.z, 0, 0.01), "Expected z component to be 0, but got " + player.viewVector.z);
      test.assert(player.rotation.y == 90, "Expected body rotation to be 90, but got " + player.rotation.y);
      player.lookAtBlock(new BlockLocation(2, 3, 0));
    })
    .thenExecuteAfter(10, () => {
      test.assert(
        isNear(player.viewVector.x, 0.7, 0.01),
        "Expected x component to be .70, but got " + player.viewVector.x
      );
      test.assert(
        isNear(player.viewVector.y, -0.08, 0.01),
        "Expected y component to be -0.08, but got " + player.viewVector.y
      );
      test.assert(
        isNear(player.viewVector.z, -0.7, 0.01),
        "Expected z component to be -0.70, but got " + player.viewVector.z
      );
      test.assert(player.rotation.y == -135, "Expected body rotation to be -135, but got " + player.rotation.y);
      player.lookAtBlock(new BlockLocation(1, 5, 1));
    })
    .thenExecuteAfter(10, () => {
      test.assert(isNear(player.viewVector.x, 0, 0.01), "Expected x component to be 0, but got " + player.viewVector.x);
      test.assert(isNear(player.viewVector.y, 1, 0.01), "Expected y component to be 1, but got " + player.viewVector.y);
      test.assert(isNear(player.viewVector.z, 0, 0.01), "Expected z component to be 0, but got " + player.viewVector.z);
      test.assert(player.rotation.y == -135, "Expected body rotation to be -135, but got " + player.rotation.y);

      const head = test.relativeLocation(player.headLocation);
      test.assert(isNear(head.x, 1.5, 0.01), "Expected x component to be 1.5, but got " + head.x);
      test.assert(isNear(head.y, 3.52, 0.01), "Expected y component to be 3.52, but got " + head.y);
      test.assert(isNear(head.z, 1.5, 0.01), "Expected z component to be 1.5, but got " + head.z);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "set_velocity", (test) => {
  const zombie = test.spawnWithoutBehaviors("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test
    .startSequence()
    .thenExecuteFor(30, () => {
      zombie.setVelocity(new Vector(0, 0.1, 0));
    })
    .thenExecute(() => {
      const zombieLoc = test.relativeLocation(zombie.location);
      const expectedLoc = new Location(1.5, 5.0, 1.5);

      test.assert(zombieLoc.isNear(expectedLoc, 0.01), "Expected zombie to levitate to specific place.");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "lore", (test) => {
  let itemStack = new ItemStack(MinecraftItemTypes.diamondSword);
  itemStack.setLore(["test lore 0", "test lore 1", "test lore 2"]);
  let lore = itemStack.getLore();
  test.assert(lore.length === 3, "Expected 3 lore lines, but got " + lore.length);
  test.assert(lore[0] === "test lore 0", "Expected lore line 0 to be 'test lore 0', but got " + lore[0]);
  test.assert(lore[1] === "test lore 1", "Expected lore line 1 to be 'test lore 1', but got " + lore[1]);
  test.assert(lore[2] === "test lore 2", "Expected lore line 2 to be 'test lore 2', but got " + lore[2]);

  const chestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const inventoryComp = chestCart.getComponent("inventory");
  inventoryComp.container.addItem(itemStack);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "data_driven_actor_event", async (test) => {
  let globalBeforeTriggerSuccess = false;
  let entityEventFilteredBeforeTriggerSuccess = false;
  let globalTriggerSuccess = false;
  let entityEventFilteredTriggerSuccess = false;

  //Global Trigger
  let globalBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    if (event.entity.id == "minecraft:llama" && event.id == "minecraft:entity_spawned") {
      globalBeforeTriggerSuccess = true;
    }

    //Force the llama to spawn as a baby
    if (
      event.modifiers.length > 0 &&
      event.modifiers[0].triggers.length > 0 &&
      event.modifiers[0].triggers[0].eventName == "minecraft:spawn_adult"
    ) {
      event.modifiers[0].triggers[0].eventName = "minecraft:spawn_baby";
    }
  });

  let globalTrigger = world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
    if (event.entity.id == "minecraft:llama" && event.id == "minecraft:entity_spawned") {
      if (!globalBeforeTriggerSuccess) test.fail("globalBeforeTrigger didn't fire for the entity_spawned event!");
      globalTriggerSuccess = true;
    }
  });

  //Trigger filtered by entity type and event type
  let entityEventFilterOptions = new EntityDataDrivenTriggerEventOptions();
  entityEventFilterOptions.entityTypes.push("minecraft:llama");
  entityEventFilterOptions.eventTypes.push("minecraft:entity_spawned");

  let entityEventBeforeFilterTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    entityEventFilteredBeforeTriggerSuccess = true;
  }, entityEventFilterOptions);

  let entityEventFilterTrigger = world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
    if (!entityEventFilteredBeforeTriggerSuccess)
      test.fail("actorEventBeforeFilterTrigger didn't fire for the entity_spawned event!");
    entityEventFilteredTriggerSuccess = true;
  }, entityEventFilterOptions);

  const llama = test.spawn("minecraft:llama", new BlockLocation(1, 2, 1));
  const villager = test.spawn("minecraft:villager_v2", new BlockLocation(1, 2, 1));

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(globalBeforeTrigger);
  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(entityEventBeforeFilterTrigger);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(globalTrigger);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(entityEventFilterTrigger);

  let specificEntityBeforeTriggerSuccess = false;

  //Event bound to a specific entity
  let specificEntityFilterOptions = new EntityDataDrivenTriggerEventOptions();
  specificEntityFilterOptions.entities.push(llama);
  specificEntityFilterOptions.eventTypes.push("minecraft:ageable_grow_up");

  let specificEntityEventBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    event.cancel = true;
    specificEntityBeforeTriggerSuccess = true;
  }, specificEntityFilterOptions);

  //Event bound to both entities, but only fire on villager to show that multi-filters work
  let allEntityFilterOptions = new EntityDataDrivenTriggerEventOptions();
  allEntityFilterOptions.entities.push(llama);
  allEntityFilterOptions.entities.push(villager);
  allEntityFilterOptions.entityTypes.push("minecraft:villager_v2");
  allEntityFilterOptions.eventTypes.push("minecraft:ageable_grow_up");

  let allEntitiesTriggerCount = 0;

  let allEntitiesEventBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    allEntitiesTriggerCount += 1;
  }, allEntityFilterOptions);
  llama.triggerEvent("minecraft:ageable_grow_up");
  villager.triggerEvent("minecraft:ageable_grow_up");

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(specificEntityEventBeforeTrigger);
  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(allEntitiesEventBeforeTrigger);

  if (!globalBeforeTriggerSuccess) test.fail("Global beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (!entityEventFilteredBeforeTriggerSuccess)
    test.fail("Filtered entity/event beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (!globalTriggerSuccess) test.fail("Global dataDrivenEntityTriggerEvent didn't fire!");
  if (!entityEventFilteredTriggerSuccess) test.fail("Filtered entity/event dataDrivenEntityTriggerEvent didn't fire!");
  if (!specificEntityBeforeTriggerSuccess) test.fail("Specific entity beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (allEntitiesTriggerCount != 1)
    test.fail("All filters beforeDataDrivenEntityTriggerEvent didn't fire exactly one time!");

  await test.idle(10);
  if (llama.getComponent("minecraft:is_baby") == null)
    test.fail("Llama was able to grow up! The beforeDataDrivenEntityTriggerEvent should prevent this!");

  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "property_components", async (test) => {
  // The following components aren't present in this test since either there aren't mobs that use that component
  //  or it is difficult to get them into the correct state.
  // skin_id, push_through, ground_offset, friction_modifier, floats_in_liquid, wants_jockey, is_shaking

  let testComponent = (entity, compName, expectedValue, canSet) => {
    let comp = entity.getComponent("minecraft:" + compName);
    test.assert(comp != null, "Entity did not have expected component " + compName);
    if (expectedValue !== undefined) {
      let v = comp.value;
      let pass = false;
      if (typeof v === "number") {
        pass = Math.abs(expectedValue - v) <= 0.001;
      } else {
        pass = v == expectedValue;
      }
      test.assert(pass, `Component ${compName} didn't have expected value! Found ${v}, expected ${expectedValue}`);

      if (canSet === undefined || canSet === true) {
        comp.value = v;
      }
    }
  };

  const zombie = test.spawn("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  testComponent(zombie, "can_climb");

  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  testComponent(bee, "can_fly");
  testComponent(bee, "flying_speed", 0.15);
  testComponent(bee, "is_hidden_when_invisible");

  bee.triggerEvent("collected_nectar");
  await test.idle(1);
  testComponent(bee, "is_charged");

  const magma_cube = test.spawn("magma_cube", new BlockLocation(1, 2, 1));
  testComponent(magma_cube, "fire_immune");

  const horse = test.spawn("horse", new BlockLocation(1, 2, 1));
  horse.triggerEvent("minecraft:horse_saddled");
  await test.idle(1);
  testComponent(horse, "is_saddled");
  testComponent(horse, "can_power_jump");

  let forceSpawnBaby = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    //Force the llama to spawn as a baby
    if (
      event.modifiers.length > 0 &&
      event.modifiers[0].triggers.length > 0 &&
      event.modifiers[0].triggers[0].eventName == "minecraft:spawn_adult"
    ) {
      event.modifiers[0].triggers[0].eventName = "minecraft:spawn_baby";
    }
  });

  const llama = test.spawn("llama", new BlockLocation(1, 2, 1));
  testComponent(llama, "is_baby");
  testComponent(llama, "scale", 0.5);

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(forceSpawnBaby);

  llama.triggerEvent("minecraft:ageable_grow_up");
  llama.triggerEvent("minecraft:on_tame");
  llama.triggerEvent("minecraft:on_chest");
  await test.idle(1);
  testComponent(llama, "is_tamed");
  testComponent(llama, "is_chested");
  testComponent(llama, "mark_variant", 0);

  const pillager = test.spawn("pillager", new BlockLocation(1, 2, 1));
  pillager.triggerEvent("minecraft:spawn_as_illager_captain");
  await test.idle(1);
  testComponent(pillager, "is_illager_captain");

  const ravager = test.spawn("ravager", new BlockLocation(1, 2, 1));
  ravager.triggerEvent("minecraft:become_stunned");
  await test.idle(1);
  testComponent(ravager, "is_stunned");

  const sheep = test.spawn("sheep", new BlockLocation(1, 2, 1));
  sheep.triggerEvent("wololo");
  sheep.triggerEvent("minecraft:on_sheared");
  await test.idle(1);
  testComponent(sheep, "is_sheared");
  await test.idle(1);
  testComponent(sheep, "color", 14);

  const cat = test.spawn("cat", new BlockLocation(1, 2, 1));
  cat.triggerEvent("minecraft:spawn_midnight_cat");
  await test.idle(1);
  testComponent(cat, "variant", 9, false);

  const tnt = test.spawn("tnt_minecart", new BlockLocation(1, 2, 1));
  tnt.triggerEvent("minecraft:on_prime");
  await test.idle(1);
  testComponent(tnt, "is_ignited");
  testComponent(tnt, "is_stackable");
  tnt.kill();

  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "entity_hit_event_hits_entity", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let hitCallback = world.events.entityHit.subscribe((e) => {
    if (e.entity === player) {
      test.assert(e.hitEntity === cow, "Expected target to be cow, but got " + e.hitEntity);
      test.assert(e.hitBlock === undefined, "Expected no hit block, but got " + e.hitBlock?.id);
      world.events.entityHit.unsubscribe(hitCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.attackEntity(cow);
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "entity_hit_event_hits_block", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const blockLoc = new BlockLocation(1, 2, 1);
  test.setBlockType(MinecraftBlockTypes.diamondBlock, blockLoc);

  let hitCallback = world.events.entityHit.subscribe((e) => {
    if (e.entity === player) {
      test.assert(e.hitEntity === undefined, "Expected no hit entity, but got " + e.target);
      test.assert(e.hitBlock?.id === "minecraft:diamond_block", "Expected no hit block, but got " + e.hitBlock?.id);
      world.events.entityHit.unsubscribe(hitCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.breakBlock(blockLoc);
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_skeleton_hurts_player", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const skeleton = test.spawn("skeleton", new BlockLocation(3, 2, 3));

  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === player) {
      test.assert(
        e.damagingEntity === skeleton,
        "Expected damagingEntity to be skeleton but got " + e.damagingEntity.id
      );
      test.assert(e.cause === EntityDamageCause.projectile, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.projectile.id === "minecraft:arrow", "Expected projectile to be arrow but got " + e.cause);
      test.assert(e.damage > 0, "Expected damage to be greater than 0, but got " + e.damage);
      world.events.entityHurt.unsubscribe(hurtCallback);
      test.succeed();
    }
  });
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_skeleton_kills_player", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const skeleton = test.spawn("skeleton", new BlockLocation(3, 2, 3));

  player.getComponent("health").setCurrent(1);

  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === player) {
      test.assert(
        e.damagingEntity === skeleton,
        "Expected damagingEntity to be skeleton but got " + e.damagingEntity.id
      );
      test.assert(e.cause === EntityDamageCause.projectile, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.projectile.id === "minecraft:arrow", "Expected projectile to be arrow but got " + e.cause);
      test.assert(e.damage > 0, "Expected damage to be greater than 0, but got " + e.damage);
      const health = player.getComponent("health").current;
      test.assert(health < 0, "Expected negative player health, but got " + health);
      world.events.entityHurt.unsubscribe(hurtCallback);
      test.succeed();
    }
  });
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_player_hurts_cow", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === cow) {
      test.assert(e.cause === EntityDamageCause.entityAttack, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.damage === 1, "Expected damage to be 1, but got " + e.damage);
      world.events.entityHurt.unsubscribe(hurtCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.attackEntity(cow);
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_player_kills_chicken", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const chicken = test.spawn("minecraft:chicken<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let maxHealth = chicken.getComponent("minecraft:health").current;
  let expectedHealth = maxHealth;
  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === chicken) {
      test.assert(e.cause === EntityDamageCause.entityAttack, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.damage === 1, "Expected damage to be 1, but got " + e.damage);
      let health = e.hurtEntity.getComponent("minecraft:health").current;
      --expectedHealth;
      test.assert(health === expectedHealth, "Expected health to be " + expectedHealth + " but got " + health);
      if (expectedHealth === 0) {
        world.events.entityHurt.unsubscribe(hurtCallback);
        test.succeed();
      }
    }
  });

  for (let i = 0; i < maxHealth; i++) {
    await test.idle(20);
    player.attackEntity(chicken);
  }
})
  .maxTicks(100)
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "projectile_hit_event_block", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const targetLoc = new BlockLocation(1, 3, 7);

  let projectileHitCallback = world.events.projectileHit.subscribe((e) => {
    if (e.blockHit && test.relativeBlockLocation(e.blockHit.block.location).equals(targetLoc)) {
      world.events.projectileHit.unsubscribe(projectileHitCallback);
      try {
        test.assert(e.dimension === test.getDimension(), "Unexpected dimension");
        test.assert(e.entityHit === undefined, "Expected no entity hit");
        test.assert(
          e.projectile?.id === "minecraft:arrow",
          "Expected projectile to be arrow, but got " + e.projectile?.id
        );
        test.assert(e.source?.id === "minecraft:player", "Expected source to be player, but got " + e.source?.id);
        test.assert(
          isNearVec(e.hitVector, test.rotateVector(Vector.forward), 0.1),
          `Expected e.hitVector to be forward, but got [${e.hitVector.x}, ${e.hitVector.y}, ${e.hitVector.z}]`
        );
        test.assert(
          e.blockHit.block?.id === "minecraft:target",
          "Expected block to be target, but got " + e.blockHit.block?.id
        );
        test.assert(e.blockHit.face == test.rotateDirection(Direction.north), "Expected north block face");
        test.assert(
          isNear(e.blockHit.faceLocationX, 0, 5, 0.1),
          "Expected faceLocationX to be near center, but got " + e.blockHit.faceLocationX
        );
        test.assert(
          isNear(e.blockHit.faceLocationY, 0.5, 0.2),
          "Expected faceLocationY to be near center, but got " + e.blockHit.faceLocationY
        );
        test.succeed();
      } catch (ex) {
        test.fail(ex);
      }
    }
  });

  await test.idle(5);
  player.giveItem(new ItemStack(MinecraftItemTypes.bow, 1), false);
  player.giveItem(new ItemStack(MinecraftItemTypes.arrow, 64), false);
  await test.idle(5);
  player.useItemInSlot(0);
  await test.idle(50);
  player.stopUsingItem();
})
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "projectile_hit_event_entity", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));

  let projectileHitCallback = world.events.projectileHit.subscribe((e) => {
    if (e.entityHit && e.entityHit.entity === blaze) {
      world.events.projectileHit.unsubscribe(projectileHitCallback);
      test.assert(e.blockHit === undefined, "Expected no block hit");
      test.assert(e.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(
        e.projectile?.id === "minecraft:snowball",
        "Expected projectile to be snowball, but got " + e.projectile?.id
      );
      test.assert(e.source?.id === "minecraft:player", "Expected source to be player, but got " + e.source?.id);
      test.assert(
        isNearVec(e.hitVector, test.rotateVector(Vector.forward)),
        `Expected e.hitVector to be forward, but got [${e.hitVector.x}, ${e.hitVector.y}, ${e.hitVector.z}]`
      );
      test.assert(
        e.entityHit.entity?.id === "minecraft:blaze",
        "Expected entity to be blaze, but got " + e.entityHit.entity?.id
      );
      test.succeed();
    }
  });

  await test.idle(5);
  player.useItem(new ItemStack(MinecraftItemTypes.snowball));
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "rotate_entity", async (test) => {
  const rotate360 = async (entity) => {
    for (let i = 0; i < 360; i += 10) {
      await test.idle(1);
      entity.setRotation(i, i);
      let rotX = entity.rotation.x;
      let rotY = entity.rotation.y;
      if (rotX < 0) {
        rotX += 360;
      }
      if (rotY < 0) {
        rotY += 360;
      }
      test.assert(rotX === i, `Expected rotX to be ${i} but got ${rotX}`);
      test.assert(rotY === i, `Expected rotY to be ${i} but got ${rotY}`);
    }
  };

  const spawnLoc = new BlockLocation(1, 2, 1);
  const cow = test.spawnWithoutBehaviors("minecraft:cow<minecraft:ageable_grow_up>", spawnLoc);
  await rotate360(cow);
  cow.kill();
  const armorStand = test.spawn("armor_stand", spawnLoc);
  await rotate360(armorStand);
  armorStand.kill();
  const player = test.spawnSimulatedPlayer(spawnLoc);
  await rotate360(player);
  test.succeed();
})
  .maxTicks(400)
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "teleport_keep_velocity", (test) => {
  const arrow = test.spawn("arrow", new BlockLocation(2, 4, 1));
  // The arrow should fall 1 block before hitting the target
  arrow.setVelocity(test.rotateVector(new Vector(0, 0, 1.2)));
  let relativeLoc = test.relativeLocation(arrow.location);
  relativeLoc.x -= 1;
  let teleportLoc = test.worldLocation(relativeLoc);
  arrow.teleport(teleportLoc, arrow.dimension, 0, 0, true);
  let velocity = arrow.velocity.length();
  test.assert(velocity > 0.5, "Expected velocity to be greater than 0.5, but got " + velocity);
  test.succeed();
})
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync(`APITests`, `teleport_keep_velocity_mob`, async (test) => {
  let pig1 = test.spawn(`minecraft:pig<minecraft:ageable_grow_up>`, new BlockLocation(0, 10, 0));
  let pig2 = test.spawn(`minecraft:pig<minecraft:ageable_grow_up>`, new BlockLocation(0, 10, 2));
  let simPlayer1 = test.spawnSimulatedPlayer(new BlockLocation(2, 10, 0));
  let simPlayer2 = test.spawnSimulatedPlayer(new BlockLocation(2, 10, 2));

  await test.idle(2);
  const velocity = new Vector(0, 5, 0);
  pig1.setVelocity(velocity);
  pig2.setVelocity(velocity);
  simPlayer1.setVelocity(velocity);
  simPlayer2.setVelocity(velocity);

  await test.idle(20);
  pig1.teleport(test.worldLocation(new Location(0.5, 2, 0.5)), world.getDimension(`overworld`), 0, 0, false); // don't keep velocity
  pig2.teleport(test.worldLocation(new Location(0.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, true); // keep velocity

  simPlayer1.teleport(test.worldLocation(new Location(2.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, false); // don't keep velocity
  try {
    simPlayer2.teleport(test.worldLocation(new Location(2.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, true); // keep velocity, not supported for players
    test.fail("Expected exception when keepVelocity is true on player");
  } catch (ex) {
    test.assert(ex === "keepVelocity is not supported for player teleportation", ex);
  }

  test.assert(pig1.velocity.y === 0, `Expected pig1.velocity.y to be 0, but got ${pig1.velocity.y}`);
  test.assert(pig2.velocity.y > 1.5, `Expected pig2.velocity.y to be > 1.5, but got ${pig2.velocity.y}`);
  test.assert(simPlayer1.velocity.y === 0, `Expected simPlayer1.velocity.y to be 0, but got ${simPlayer1.velocity.y}`);

  pig1.kill();
  pig2.kill();

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);
