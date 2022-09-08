import * as GameTest from "mojang-gametest";
import { BlockLocation, Location, MinecraftItemTypes, ItemStack } from "mojang-minecraft";

function isNear(n1, n2) {
  return Math.abs(n1 - n2) < 0.01;
}

GameTest.register("ComponentTests", "color_component", (test) => {
  const sheep = test.spawn("minecraft:sheep", new BlockLocation(1, 2, 1));
  let counter = 0;
  test.succeedWhen(() => {
    const colorComponent = sheep.getComponent("minecraft:color");
    const color = colorComponent.value;
    if (++counter < 48) {
      colorComponent.value = (color + 1) % 16;
      throw "Disco sheep!";
    } else {
      colorComponent.value = 10;
      test.assert(colorComponent.value === 10, "Unexpected color value");
    }
  });
})
  .maxTicks(50)
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "get_component_on_dead_entity", (test) => {
  const horse = test.spawn("minecraft:horse", new BlockLocation(1, 2, 1));
  horse.kill();
  test.runAfterDelay(40, () => {
    try {
      // This should throw since the entity is dead
      horse.getComponent("minecraft:tamemount").setTamed();
      test.fail();
    } catch (e) {
      test.succeed();
    }
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "is_saddled_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  // TODO: Give saddle to pig
  test.succeedWhen(() => {
    const isSaddled = pig.getComponent("minecraft:is_saddled") !== undefined;
    test.assert(isSaddled, "Expected pig to be saddled");
  });
}).tag(GameTest.Tags.suiteDisabled); // No API to give saddle to pig

GameTest.register("ComponentTests", "get_components", (test) => {
  const horse = test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test.print("---Start Components---");
  for (const component of horse.getComponents()) {
    test.print(component.id);
  }
  test.print("---End Components---");
  test.succeed();
}).structureName("ComponentTests:animal_pen");

GameTest.register("ComponentTests", "leashable_component", (test) => {
  const pig1 = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const pig2 = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 1));
  const leashableComp = pig1.getComponent("leashable");
  test.assert(leashableComp !== undefined, "Expected leashable component");
  test.assert(leashableComp.softDistance === 4, "Unexpected softDistance");
  leashableComp.leash(pig2);
  test.runAtTickTime(20, () => {
    leashableComp.unleash();
  });
  test.succeedWhen(() => {
    test.assertEntityPresentInArea("minecraft:item", true); // Make sure the lead dropped
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "health_component", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const sheepPos = new BlockLocation(4, 2, 2);
  const sheep = test.spawn(sheepId, sheepPos);
  test.assertEntityInstancePresent(sheep, sheepPos);
  test.pullLever(new BlockLocation(2, 3, 2));

  const healthComponent = sheep.getComponent("minecraft:health");
  test.assert(healthComponent !== undefined, "Expected health component");

  test.succeedWhen(() => {
    test.assert(healthComponent.current === 0, "Unexpected health");
  });
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "rideable_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const boat = test.spawn("minecraft:boat", new BlockLocation(3, 2, 1));
  const skeletonHorse = test.spawn("minecraft:skeleton_horse<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 1));

  const boatRideableComp = boat.getComponent("minecraft:rideable");
  test.assert(boatRideableComp !== undefined, "Expected rideable component");

  test.assert(boatRideableComp.seatCount === 2, "Unexpected seatCount");
  test.assert(boatRideableComp.crouchingSkipInteract, "Unexpected crouchingSkipInteract");
  test.assert(boatRideableComp.interactText === "action.interact.ride.boat", "Unexpected interactText");
  test.assert(boatRideableComp.familyTypes.length == 0, "Unexpected familyTypes");
  test.assert(boatRideableComp.controllingSeat === 0, "Unexpected controllingSeat");
  test.assert(boatRideableComp.pullInEntities, "Unexpected pullInEntities");
  test.assert(!boatRideableComp.riderCanInteract, "Unexpected riderCanInteract");

  test.assert(boatRideableComp.seats[0].minRiderCount === 0, "Unexpected minRiderCount");
  test.assert(boatRideableComp.seats[0].maxRiderCount === 1, "Unexpected maxRiderCount");
  test.assert(boatRideableComp.seats[0].lockRiderRotation === 90, "Unexpected lockRiderRotation");

  const skeletonHorseRideableComp = skeletonHorse.getComponent("minecraft:rideable");
  test.assert(skeletonHorseRideableComp !== undefined, "Expected rideable component");

  test
    .startSequence()
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.addRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.ejectRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.addRider(skeletonHorse))
    .thenExecute(() => boatRideableComp.addRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.ejectRiders())
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "tameable_component", (test) => {
  const wolf = test.spawn("minecraft:wolf", new BlockLocation(1, 2, 1));
  const tameableComp = wolf.getComponent("minecraft:tameable");
  test.assert(tameableComp !== undefined, "Expected tameable component");
  test.assert(isNear(tameableComp.probability, 0.333), "Unexpected probability");
  test.assert(tameableComp.tameItems[0] === "minecraft:bone", "Unexpected tameItems");
  tameableComp.tame(/*player*/); // TODO: Provide an owner
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "healable_component", (test) => {
  const parrot = test.spawn("minecraft:parrot", new BlockLocation(1, 2, 1));
  const healableComp = parrot.getComponent("minecraft:healable");
  test.assert(healableComp !== undefined, "Expected healable component");
  test.assert(healableComp.forceUse, "Unexpected forceUse");
  test.assert(healableComp.filters !== undefined, "Expected filters");
  const feedItem = healableComp.items[0];
  test.assert(feedItem.item === "minecraft:cookie", "Unexpected feedItem item");
  test.assert(feedItem.healAmount === 0, "Unexpected feedItem healAmount");
  const effect = feedItem.effects[0];
  test.assert(effect.amplifier === 0, "Unexpected effect amplifier");
  test.assert(effect.chance === 1, "Unexpected effect chance");
  test.assert(effect.duration === 20000, "Unexpected effect duration");
  test.assert(effect.name === "potion.poison", "Unexpected effect name");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const movementComp = pig.getComponent("minecraft:movement");
  test.assert(movementComp !== undefined, "Expected movement component");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "flying_speed_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const flyingSpeedComp = bee.getComponent("flying_speed");
  test.assert(flyingSpeedComp !== undefined, "Expected flying_speed component");
  test.assert(isNear(flyingSpeedComp.value, 0.15), "Unexpected value");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_amphibious_component", (test) => {
  const turtle = test.spawn("turtle", new BlockLocation(1, 2, 1));
  const amphibiousComp = turtle.getComponent("movement.amphibious");
  test.assert(amphibiousComp !== undefined, "Expected movement.amphibious component");
  test.assert(amphibiousComp.maxTurn === 5, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_basic_component", (test) => {
  const chicken = test.spawn("chicken", new BlockLocation(1, 2, 1));
  const movementBasicComp = chicken.getComponent("movement.basic");
  test.assert(movementBasicComp !== undefined, "Expected movement.basic component");
  test.assert(movementBasicComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_fly_component", (test) => {
  const parrot = test.spawn("parrot", new BlockLocation(1, 2, 1));
  const movementFlyComp = parrot.getComponent("movement.fly");
  test.assert(movementFlyComp !== undefined, "Expected movement.fly component");
  test.assert(movementFlyComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_generic_component", (test) => {
  const drowned = test.spawn("drowned", new BlockLocation(1, 2, 1));
  const movementGenericComp = drowned.getComponent("movement.generic");
  test.assert(movementGenericComp !== undefined, "Expected movement.generic component");
  test.assert(movementGenericComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_glide_component", (test) => {
  const phantom = test.spawn("phantom", new BlockLocation(2, 2, 2));
  const movementGlideComp = phantom.getComponent("movement.glide");
  test.assert(movementGlideComp !== undefined, "Expected movement.glide component");
  test.assert(movementGlideComp.maxTurn === 30, "Unexpected maxTurn");
  test.assert(isNear(movementGlideComp.startSpeed, 0.1), "Unexpected startSpeed");
  test.assert(isNear(movementGlideComp.speedWhenTurning, 0.2), "Unexpected speedWhenTurning");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_hover_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const movementHoverComp = bee.getComponent("movement.hover");
  test.assert(movementHoverComp !== undefined, "Expected movement.hover component");
  test.assert(movementHoverComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_jump_component", (test) => {
  const slime = test.spawn("slime", new BlockLocation(2, 2, 2));
  const movementJumpComp = slime.getComponent("movement.jump");
  test.assert(movementJumpComp !== undefined, "Expected movement.jump component");
  test.assert(isNear(movementJumpComp.maxTurn, 0.42), "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_skip_component", (test) => {
  const rabbit = test.spawn("rabbit", new BlockLocation(1, 2, 1));
  const movementSkipComp = rabbit.getComponent("movement.skip");
  test.assert(movementSkipComp !== undefined, "Expected movement.skip component");
  test.assert(movementSkipComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_sway_component", (test) => {
  const salmon = test.spawn("salmon", new BlockLocation(1, 2, 1));
  const movementSwayComp = salmon.getComponent("movement.sway");
  test.assert(movementSwayComp !== undefined, "Expected movement.sway component");
  test.assert(movementSwayComp.maxTurn === 30, "Unexpected maxTurn");
  test.assert(isNear(movementSwayComp.swayFrequency, 0.5), "Unexpected swayFrequency");
  test.assert(movementSwayComp.swayAmplitude === 0, "Unexpected swayAmplitude");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "ageable_component", (test) => {
  const horse = test.spawn("minecraft:horse<minecraft:entity_born>", new BlockLocation(1, 2, 1));
  const ageableComp = horse.getComponent("ageable");
  test.assert(ageableComp !== undefined, "Expected ageable component");
  test.assert(ageableComp.duration == 1200, "Unexpected duration");
  test.assert(ageableComp.feedItems[0].item == "minecraft:wheat", "Unexpected feedItem item");
  test.assert(isNear(ageableComp.feedItems[0].growth, "0.016"), "Unexpected feedItem growth");
  test.assert(ageableComp.growUp !== undefined, "Expected growUp");
  test.assert(ageableComp.dropItems.length === 0, "Expected empty dropItems array");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "addrider_component", (test) => {
  const ravager = test.spawn(
    "minecraft:ravager<minecraft:spawn_for_raid_with_pillager_rider>",
    new BlockLocation(2, 2, 2)
  );
  const addRiderComp = ravager.getComponent("addrider");
  test.assert(addRiderComp !== undefined, "Expected addrider component");
  test.assert(addRiderComp.entityType === "minecraft:pillager<minecraft:spawn_for_raid>", "Unexpected entityType");
  test.assert(addRiderComp.spawnEvent === "minecraft:spawn_for_raid", "Unexpected spawnEvent");
  test.succeed();
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "breathable_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const breathableComp = pig.getComponent("breathable");
  test.assert(breathableComp !== undefined, "Expected breathable component");
  test.assert(breathableComp.totalSupply === 15, "Unexpected totalSupply");
  test.assert(breathableComp.suffocateTime === 0, "Unexpected suffocateTime");
  test.assert(breathableComp.inhaleTime === 0, "Unexpected inhaleTime");
  test.assert(breathableComp.breathesAir, "Unexpected breathesAir");
  test.assert(!breathableComp.breathesWater, "Unexpected breathesWater");
  test.assert(breathableComp.breathesLava, "Unexpected breathesLava");
  test.assert(!breathableComp.breathesSolids, "Unexpected breathesSolids");
  test.assert(breathableComp.generatesBubbles, "Unexpected generatesBubbles");
  test.assert(breathableComp.breatheBlocks.length == 0, "Unexpected breatheBlocks");
  test.assert(breathableComp.nonBreatheBlocks.length == 0, "Unexpected nonBreatheBlocks");
  test.succeed();
})
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_fly_component", (test) => {
  const parrot = test.spawn("parrot", new BlockLocation(1, 2, 1));
  const flyComp = parrot.getComponent("navigation.fly");
  test.assert(flyComp !== undefined, "Expected navigation.fly component");
  test.assert(!flyComp.isAmphibious, "Unexpected isAmphibious");
  test.assert(!flyComp.avoidSun, "Unexpected avoidSun");
  test.assert(flyComp.canPassDoors, "Unexpected canPassDoors");
  test.assert(!flyComp.canOpenDoors, "Unexpected canOpenDoors");
  test.assert(!flyComp.canOpenIronDoors, "Unexpected canOpenIronDoors");
  test.assert(!flyComp.canBreakDoors, "Unexpected canBreakDoors");
  test.assert(!flyComp.avoidWater, "Unexpected avoidWater");
  test.assert(!flyComp.avoidDamageBlocks, "Unexpected avoidDamageBlocks");
  test.assert(flyComp.canFloat, "Unexpected canFloat");
  test.assert(flyComp.canSink, "Unexpected canSink");
  test.assert(!flyComp.canPathOverLava, "Unexpected canPathOverLava");
  test.assert(!flyComp.canWalkInLava, "Unexpected canWalkInLava");
  test.assert(!flyComp.avoidPortals, "Unexpected avoidPortals");
  test.assert(flyComp.canWalk, "Unexpected canWalk");
  test.assert(!flyComp.canSwim, "Unexpected canSwim");
  test.assert(!flyComp.canBreach, "Unexpected canBreach");
  test.assert(flyComp.canJump, "Unexpected canJump");
  test.assert(flyComp.canPathFromAir, "Unexpected canPathFromAir");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_climb_component", (test) => {
  const spider = test.spawn("spider", new BlockLocation(1, 2, 1));
  const climbComp = spider.getComponent("navigation.climb");
  test.assert(climbComp !== undefined, "Expected navigation.climb component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_float_component", (test) => {
  const bat = test.spawn("bat", new BlockLocation(1, 2, 1));
  const floatComp = bat.getComponent("navigation.float");
  test.assert(floatComp !== undefined, "Expected navigation.float component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_generic_component", (test) => {
  const dolphin = test.spawn("dolphin", new BlockLocation(2, 2, 2));
  const genericComp = dolphin.getComponent("navigation.generic");
  test.assert(genericComp !== undefined, "Expected navigation.generic component");
  test.succeed();
})
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_hover_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const hoverComp = bee.getComponent("navigation.hover");
  test.assert(hoverComp !== undefined, "Expected navigation.hover component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_walk_component", (test) => {
  const creeper = test.spawn("creeper", new BlockLocation(1, 2, 1));
  const walkComp = creeper.getComponent("navigation.walk");
  test.assert(walkComp !== undefined, "Expected navigation.walk component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "inventory_component", (test) => {
  const rightChestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const leftChestCart = test.spawn("chest_minecart", new BlockLocation(2, 3, 1));

  const rightInventoryComp = rightChestCart.getComponent("inventory");
  test.assert(rightInventoryComp !== undefined, "Expected inventory component");

  const leftInventoryComp = leftChestCart.getComponent("inventory");
  test.assert(leftInventoryComp !== undefined, "Expected inventory component");
  test.assert(rightInventoryComp.additionalSlotsPerStrength === 0, "Unexpected additionalSlotsPerStrength");
  test.assert(rightInventoryComp.canBeSiphonedFrom, "Unexpected canBeSiphonedFrom");
  test.assert(rightInventoryComp.containerType === "minecart_chest", "Unexpected containerType");
  test.assert(rightInventoryComp.inventorySize === 27, "Unexpected inventorySize");
  test.assert(!rightInventoryComp.private, "Unexpected private");
  test.assert(!rightInventoryComp.restrictToOwner, "Unexpected restrictToOwner");

  const rightContainer = rightInventoryComp.container;
  test.assert(rightContainer !== undefined, "Expected container");

  const leftContainer = leftInventoryComp.container;
  test.assert(leftContainer !== undefined, "Expected container");

  rightContainer.setItem(0, new ItemStack(MinecraftItemTypes.apple, 10, 0));
  test.assert(rightContainer.getItem(0).id === "minecraft:apple", "Expected apple in right container slot index 0");

  rightContainer.setItem(1, new ItemStack(MinecraftItemTypes.emerald, 10, 0));
  test.assert(rightContainer.getItem(1).id === "minecraft:emerald", "Expected emerald in right container slot index 1");

  test.assert(rightContainer.size === 27, "Unexpected size");
  test.assert(rightContainer.emptySlotsCount === 25, "Unexpected emptySlotsCount");

  const itemStack = rightContainer.getItem(0);
  test.assert(itemStack.id === "minecraft:apple", "Expected apple");
  test.assert(itemStack.amount === 10, "Expected 10 apples");
  test.assert(itemStack.data === 0, "Expected 0 data");

  leftContainer.setItem(0, new ItemStack(MinecraftItemTypes.cake, 10, 0));

  test.assert(rightContainer.transferItem(0, 4, leftContainer), "Expected transferItem to succeed"); // transfer the apple from the right container to the left container
  test.assert(rightContainer.swapItems(1, 0, leftContainer), "Expected swapItems to succeed"); // swap the cake and emerald

  test.assert(leftContainer.getItem(4).id === "minecraft:apple", "Expected apple in left container slot index 4");
  test.assert(leftContainer.getItem(0).id === "minecraft:emerald", "Expected emerald in left container slot index 0");
  test.assert(rightContainer.getItem(1).id === "minecraft:cake", "Expected cake in right container slot index 1");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "inventory_component_transfer", (test) => {
  const chestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const inventoryComp = chestCart.getComponent("inventory");
  test.assert(inventoryComp !== undefined, "Expected inventory component");
  const container = inventoryComp.container;
  test.assert(container !== undefined, "Expected container");

  container.addItem(new ItemStack(MinecraftItemTypes.emerald, 10));
  container.setItem(1, new ItemStack(MinecraftItemTypes.emerald, 60));

  test.assert(container.transferItem(0, 1, container), "Expected transferItem to succeed"); // Transfer 4 of the emeralds, filling the stack in slot 1
  test.assert(container.getItem(0).amount === 6, "Expected 6 remaining emeralds in slot 0");
  test.assert(container.getItem(1).amount === 64, "Expected 64 emeralds in slot 1");

  test.assert(!container.transferItem(0, 1, container), "Expected transferItem to fail");
  test.assert(container.getItem(0).amount === 6, "Expected 6 remaining emeralds in slot 0");
  test.assert(container.getItem(1).amount === 64, "Expected 64 emeralds in slot 1");

  test.assert(container.transferItem(0, 2, container), "Expected transferItem to succeed");
  test.assert(container.getItem(0) === undefined, "Expected 0 remaining emeralds in slot 0");
  test.assert(container.getItem(2).amount === 6, "Expected 6 emeralds in slot 2");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "lava_movement_component", (test) => {
  const strider = test.spawn("strider", new BlockLocation(1, 2, 1));
  const lavaMovementComp = strider.getComponent("lava_movement");
  test.assert(lavaMovementComp !== undefined, "Expected lava_movement component");
  test.assert(isNear(lavaMovementComp.value, 0.32), "Unexpected value");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "strength_component", (test) => {
  const llama = test.spawn("llama", new BlockLocation(1, 2, 1));
  const strengthComp = llama.getComponent("strength");
  test.assert(strengthComp !== undefined, "Expected strength component");
  test.assert(strengthComp.value >= 0 && strengthComp.value <= 5, "Unexpected value");
  test.assert(strengthComp.max === 5, "Unexpected max");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("ComponentTests", "item_component", async (test) => {
  const itemAmount = 5;
  const torchItem = new ItemStack(MinecraftItemTypes.torch, itemAmount);
  const torch = test.spawnItem(torchItem, new Location(1.5, 2.5, 1.5));
  const itemComp = torch.getComponent("item");
  test.assert(itemComp !== undefined, "Expected item component");
  test.assert(itemComp.itemStack.id === "minecraft:torch", "Unexpected item id");
  test.assert(itemComp.itemStack.amount === itemAmount, "Unexpected item amount");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);
