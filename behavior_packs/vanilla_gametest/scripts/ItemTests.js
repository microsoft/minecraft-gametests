import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  Direction,
  MinecraftItemTypes,
  ItemStack,
  world
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

function giveItem(player, itemType, amount, slot) {
  const inventoryContainer = player.getComponent("inventory").container;
  inventoryContainer.addItem(new ItemStack(itemType, amount ?? 1));
  player.selectedSlot = slot ?? 0;
}

GameTest.register("ItemTests", "item_use_event", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));
  test.assert(blaze != undefined, "Failed to initialize Blaze");
  const blazeHealth = blaze.getComponent("health");
  let initialHealth = blazeHealth.current;

  const snowball = new ItemStack(MinecraftItemTypes.snowball, 1);

  let eventReceived = false;
  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItem(snowball);
    })
    .thenExecuteAfter(5, () => {
      world.events.itemUse.unsubscribe(eventSubscription);

      let afterUseHealth = blazeHealth.current;
      blaze.kill();

      test.assert(eventReceived, "Should have received itemUse event");

      test.assert(
        afterUseHealth < initialHealth,
        `Blaze was not hurt after snowball throw should have been cancelled: before-> ${initialHealth} after-> ${afterUseHealth}`
      );
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_event_cancelled", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));

  const snowball = new ItemStack(MinecraftItemTypes.snowball, 1);

  let eventReceived = false;
  let beforeEventReceived = false;

  const beforeEventSubscription = world.events.beforeItemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    beforeEventReceived = true;
    eventData.cancel = true;
  });

  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.useItem(snowball);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUse.unsubscribe(beforeEventSubscription);
      world.events.itemUse.unsubscribe(eventSubscription);

      test.assert(beforeEventReceived, "Should have received beforeItemUse event");
      test.assert(eventReceived == false, "Should not have received itemUse event");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_event_cancelled_stops_action", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));
  test.assert(blaze != undefined, "Failed to initialize Blaze");
  const blazeHealth = blaze.getComponent("health");
  let initialHealth = blazeHealth.current;

  const slot = 0;
  const snowballCount = 10;
  const inventoryContainer = player.getComponent("inventory").container;

  giveItem(player, MinecraftItemTypes.snowball, snowballCount, slot);

  let eventReceived = false;
  let beforeEventReceived = false;

  const beforeEventSubscription = world.events.beforeItemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    beforeEventReceived = true;
    eventData.cancel = true;
  });

  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.useItemInSlot(slot);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUse.unsubscribe(beforeEventSubscription);
      world.events.itemUse.unsubscribe(eventSubscription);

      let afterUseHealth = blazeHealth.current;
      blaze.kill();

      test.assert(beforeEventReceived, "Should have received beforeItemUse event");
      test.assert(eventReceived == false, "Should not have received itemUse event");

      let actualAmount = inventoryContainer.getItem(slot).amount;
      test.assert(
        actualAmount === snowballCount,
        `Player should have ${snowballCount} snowballs but has ${actualAmount}`
      );

      test.assert(
        afterUseHealth === initialHealth,
        `Blaze was hurt after snowball throw should have been cancelled: before-> ${initialHealth} after-> ${afterUseHealth}`
      );
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_on_event", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const dirtLoc = new BlockLocation(2, 1, 1);
  const dirt = new ItemStack(MinecraftItemTypes.dirt);

  let eventReceived = false;
  const eventSubscription = world.events.itemUseOn.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItemOnBlock(dirt, dirtLoc, Direction.up);
    })
    .thenExecuteAfter(5, () => {
      world.events.itemUseOn.unsubscribe(eventSubscription);
      test.assert(eventReceived, "Should have received itemUseOn event");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_on_event_cancelled_stops_action", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const dirtLoc = new BlockLocation(2, 1, 1);
  const dirt = new ItemStack(MinecraftItemTypes.dirt);

  const beforeEventSubscription = world.events.beforeItemUseOn.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventData.cancel = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItemOnBlock(dirt, dirtLoc, Direction.up);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUseOn.unsubscribe(beforeEventSubscription);
      test.assertBlockPresent(MinecraftBlockTypes.dirt, dirtLoc.above(), false);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_is_not_null", (test) => {
  const appleItem = new ItemStack(MinecraftItemTypes.apple);
  const itemCooldownComponent = appleItem.getComponent("minecraft:cooldown");
  test.assert(itemCooldownComponent !== undefined, "ItemCooldownComponent should never be null");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_apple_has_default_values", (test) => {
  const appleItem = new ItemStack(MinecraftItemTypes.apple);
  const itemCooldownComponent = appleItem.getComponent("minecraft:cooldown");
  test.assert(itemCooldownComponent.cooldownCategory === "", "Apple should have empty cooldown category");
  test.assert(itemCooldownComponent.cooldownTicks === 0, "Apple should have no cooldown");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_enderpearl_has_cooldown_values", (test) => {
  const enderPearlItem = new ItemStack(MinecraftItemTypes.enderPearl);
  const itemCooldownComponent = enderPearlItem.getComponent("minecraft:cooldown");
  test.assert(
    itemCooldownComponent.cooldownCategory === "ender_pearl",
    "Ender Pearl should have ender_pearl cooldown category"
  );
  test.assert(itemCooldownComponent.cooldownTicks === 20, "Ender Pearl should have cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_start_cooldown", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const enderPearlItem = new ItemStack(MinecraftItemTypes.enderPearl);
  const itemCooldownComponent = enderPearlItem.getComponent("minecraft:cooldown");

  itemCooldownComponent.startCooldown(player);

  test.assert(player.getItemCooldown("ender_pearl") === 20, "Player should have ender_pearl cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "player_startitemcooldown_has_enderpearl_cooldown", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));

  player.startItemCooldown("ender_pearl", 20);

  test.assert(player.getItemCooldown("ender_pearl") === 20, "Player should have ender_pearl cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "before_item_use_event_modifies_inventory_item", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const beforeItemUseCallback = world.events.beforeItemUse.subscribe((itemUseEvent) => {
    itemUseEvent.item.setLore(["Lore"]);
  });

  testEx.giveItem(player, MinecraftItemTypes.diamondSword);
  player.useItemInSlot(0);
  const sword = player.getComponent("inventory").container.getItem(0);
  test.assert(sword.getLore()[0] === "Lore", "Lore should have been added to sword");

  world.events.beforeItemUse.unsubscribe(beforeItemUseCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "before_item_use_on_event_modifies_inventory_item", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const beforeItemUseOnCallback = world.events.beforeItemUseOn.subscribe((itemUseEvent) => {
    itemUseEvent.item.setLore(["Lore"]);
  });

  testEx.giveItem(player, MinecraftItemTypes.planks, 16);
  player.useItemInSlotOnBlock(0, new BlockLocation(1, 2, 2));
  const planks = player.getComponent("inventory").container.getItem(0);
  test.assert(planks.getLore()[0] === "Lore", "Lore should have been added to planks");

  world.events.beforeItemUse.unsubscribe(beforeItemUseOnCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("ItemTests", "item_using_events_fire_correctly", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  let startedCharge = false, completedCharge = false, stoppedCharge = false;

  let itemStartCharge = world.events.itemStartCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(startedCharge) {
      test.fail("world.events.itemStartCharge should only have been invoked once");
    }
    if(stoppedCharge || completedCharge) {
      test.fail("world.events.itemStartCharge called out of order");
    }
    startedCharge = true;
  });
  
  let itemCompleteCharge = world.events.itemCompleteCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(completedCharge) {
      test.fail("world.events.itemCompleteCharge should only have been invoked once");
    }
    if(startedCharge == false || stoppedCharge) {
      test.fail("world.events.itemCompleteCharge called out of order");
    }
    completedCharge = true;
  });
    
  let itemStopCharge = world.events.itemStopCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(stoppedCharge) {
      test.fail("world.events.itemStopCharge should only have been invoked once");
    }
    if(startedCharge == false || completedCharge == false) {
      test.fail("world.events.itemStopCharge called out of order");
    }
    stoppedCharge = true;
  });

  player.giveItem(new ItemStack(MinecraftItemTypes.potion, 1), true);

  await test.idle(5);

  player.useItemInSlot(player.selectedSlot);

  await test.idle(20 * 5); //5 seconds

  test.assert(startedCharge, "Item should have fired started charge event");
  test.assert(completedCharge, "Item should have fired completed charge event");
  test.assert(stoppedCharge, "Item should have fired stopped charge event");

  world.events.itemStartCharge.unsubscribe(itemStartCharge);
  world.events.itemCompleteCharge.unsubscribe(itemCompleteCharge);
  world.events.itemStopCharge.unsubscribe(itemStopCharge);

  test.succeed();
})
  .maxTicks(300)
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

