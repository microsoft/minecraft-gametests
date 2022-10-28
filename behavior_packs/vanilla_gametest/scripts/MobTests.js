// Copyright (c) Microsoft Corporation.  All rights reserved.

import * as GameTest from "@minecraft/server-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftEffectTypes, MinecraftItemTypes } from "@minecraft/server";
import GameTestExtensions from "./GameTestExtensions.js";

const TicksPerSecond = 20;

GameTest.register("MobTests", "zombie_burn", (test) => {
  const zombieEntityType = "minecraft:zombie";
  const zombiePosition = new BlockLocation(1, 2, 1);

  test.succeedWhenEntityPresent(zombieEntityType, zombiePosition, false);
})
  .maxTicks(TicksPerSecond * 30)
  .tag(GameTest.Tags.suiteDefault)
  .batch("day");

GameTest.register("MobTests", "effect_durations_longer_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "drowning_test", (test) => {
  const villagerEntitySpawnType = "minecraft:villager_v2";
  const pigSpawnType = "minecraft:pig";

  test.spawn(villagerEntitySpawnType, new BlockLocation(3, 2, 2));
  test.spawn(pigSpawnType, new BlockLocation(3, 2, 4));
  test.succeedWhen(() => {
    test.assertEntityPresentInArea(pigSpawnType, false);
    test.assertEntityPresentInArea(villagerEntitySpawnType, false);
  });
})
  .maxTicks(TicksPerSecond * 45)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "golem_vs_pillager", (test) => {
  const ironGolem = "minecraft:iron_golem";
  const pillager = "minecraft:pillager";
  const ironGolemPos = new BlockLocation(3, 2, 3);
  const pillagerPos = new BlockLocation(3, 2, 4);

  test.spawn(ironGolem, ironGolemPos);
  test.spawn(pillager, pillagerPos);

  test.succeedWhen(() => {
    test.assertEntityPresent(pillager, ironGolemPos, false);
    test.assertEntityPresent(ironGolem, pillagerPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "effect_durations_stronger_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "silverfish_no_suffocate", (test) => {
  const silverfishPos = new BlockLocation(1, 2, 1);
  const silverfish = "minecraft:silverfish";

  test
    .startSequence()
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenIdle(40)
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenSucceed();
  test
    .startSequence()
    .thenWait(() => test.assertEntityPresent(silverfish, silverfishPos, false))
    .thenFail("Silverfish died");
})
  .maxTicks(TicksPerSecond * 30)
  .required(false)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_keep_head_above_water", (test) => {
  const testEx = new GameTestExtensions(test);
  const swimmerPos = new BlockLocation(1, 3, 1); //When the silverfish is produced at (1, 2, 1), the silverfish is stuck in the glass below and dies, so the y-axis goes up one frame
  const swimmer = test.spawn("minecraft:silverfish", swimmerPos);

  const drownerPos = new BlockLocation(5, 2, 1);
  const drowner = test.spawn("minecraft:silverfish", drownerPos);

  testEx.makeAboutToDrown(swimmer);
  testEx.makeAboutToDrown(drowner);

  test
    .startSequence()
    .thenWaitAfter(40, () => {
      test.assertEntityPresent("minecraft:silverfish", swimmerPos, true);
      test.assertEntityPresent("minecraft:silverfish", drownerPos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_breathe_in_boats", (test) => {
  const testEx = new GameTestExtensions(test);
  const catPos = new BlockLocation(2, 3, 2);
  const cat = testEx.addEntityInBoat("minecraft:cat", catPos);
  testEx.makeAboutToDrown(cat);

  const silverfishPos = new BlockLocation(4, 3, 2);
  const silverfish = testEx.addEntityInBoat("minecraft:silverfish", silverfishPos);
  testEx.makeAboutToDrown(silverfish);

  const underWaterPos = new BlockLocation(6, 2, 2);
  const silverfish2 = testEx.addEntityInBoat("minecraft:silverfish", underWaterPos);
  testEx.makeAboutToDrown(silverfish2);

  test
    .startSequence()
    .thenIdle(40)
    .thenExecute(() => test.assertEntityPresent("minecraft:cat", catPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", silverfishPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", underWaterPos, false))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

///
// Axolotl Tests
///
const platformStructure = "ComponentTests:platform";

GameTest.register("MobTests", "axolotl_bucket_capture", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_axolotl");
  let target = test.spawn("minecraft:axolotl", new BlockLocation(1, 5, 2));
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()

    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.waterBucket, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithEntity(target) == true, ""))
    .thenExecute(() =>
      test.assert(playerSim.getComponent("inventory").container.getItem(0).id === "minecraft:axolotl_bucket", "")
    )
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "axolotl_attacks_squid", (test) => {
  let axlSpawn = new BlockLocation(2, 3, 2);
  let squidSpawn = new BlockLocation(2, 4, 2);
  test.spawn("minecraft:axolotl", axlSpawn);
  let prey = test.spawn("minecraft:squid", squidSpawn);
  let preyHealth = prey.getComponent("health").current;
  test
    .startSequence()
    .thenIdle(20)
    .thenWait(() => test.assert(prey.getComponent("health").current < preyHealth, ""))
    .thenSucceed();
})
  .maxTicks(140)
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "axolotl_lure_no_attack", (test) => {
  const playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_axolotl_lure");
  let prey = test.spawn("minecraft:squid", new BlockLocation(1, 1, 1));
  let prey_health = prey.getComponent("health").current;
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()
    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.tropicalFishBucket, 1, 0))
    .thenExecute(() => test.spawn("minecraft:axolotl", new BlockLocation(1, 5, 2)))
    .thenIdle(60)
    .thenExecute(() => test.assert(prey.getComponent("health").current == prey_health, ""))
    .thenSucceed();
})
  .structureName("MobTests:axolotl_lure")
  .tag(GameTest.Tags.suiteDefault);

///
// Goat Tests
///

GameTest.register("MobTests", "goat_wheat_breeding", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0), "playerSim_goat");
  let goat_1 = test.spawn("minecraft:goat<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));
  let goat_2 = test.spawn("minecraft:goat<minecraft:ageable_grow_up>", new BlockLocation(0, 2, 1));
  const testEx = new GameTestExtensions(test);
  test
    .startSequence()
    .thenExecuteAfter(10, () => testEx.giveItem(playerSim, MinecraftItemTypes.wheat, 3, 0))
    .thenExecute(() => playerSim.interactWithEntity(goat_1))
    .thenExecute(() => playerSim.interactWithEntity(goat_2))
    .thenExecuteAfter(60, () => goat_1.kill())
    .thenExecute(() => goat_2.kill())
    .thenWait(() => test.assertEntityPresentInArea("minecraft:goat", true)) //does not count red, dying goats as a goat entity. Only counts the newborn baby
    .thenSucceed();
})
  .maxTicks(120)
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "piglin_should_drop_different_loots", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 3, 1));
  const inventoryContainer = player.getComponent("inventory").container;
  const goldIngotCount = 10;
  const piglinEntityType = "minecraft:piglin<spawn_adult>";
  const piglin = test.spawn(piglinEntityType, new BlockLocation(1, 2, 2));

  testEx.giveItem(player, MinecraftItemTypes.goldIngot, goldIngotCount);

  let sequence = test.startSequence().thenIdle(5);
  //Barter with piglin up to 10 times
  for (let i = 1; i <= goldIngotCount; i++) {
    sequence
      .thenExecute(() => {
        try {
          player.selectedSlot = 0;
          player.interactWithEntity(piglin);
        } catch {}
      })
      .thenExecuteAfter(200, () => {
        piglin.triggerEvent("stop_zombification_event");

        // Check the player's inventory for 2 unique items
        for (let j = 1; j <= i; j++) {
          try {
            let item1 = inventoryContainer.getItem(j);
            let item2 = inventoryContainer.getItem(j + 1);
            if (item2 != undefined && item1.id != item2.id) {
              test.succeed();
            }
          } catch (e) {}
        }
      });
  }
  sequence.thenFail("Failed to obtain 2 or more unique items from bartering");
})
  .maxTicks(3000)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "ravager_flowing_water_edge_fall", (test) => {
  const spawnType = "minecraft:ravager";
  const spawnPos = new BlockLocation(2, 6, 2);
  const targetPos = new BlockLocation(2, 2, 2);
  test.spawn(spawnType, spawnPos);
  test.succeedWhenEntityPresent(spawnType, targetPos, true);
})
  .maxTicks(60)
  .structureName("mobtests:ravager_flowing_water_edge_fall")
  .tag(GameTest.Tags.suiteDefault);
