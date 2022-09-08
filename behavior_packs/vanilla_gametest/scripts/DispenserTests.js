import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftItemTypes, ItemStack } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const armorSlotTorso = 1;
const pinkCarpet = 6;
const tameMountComponentName = "minecraft:tamemount";
const threeSecondsInTicks = 60;

GameTest.register("DispenserTests", "dispenser_shears_sheep", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(sheepId, entityLoc);
  test.assertEntityPresent(sheepId, entityLoc, true);
  test.assertEntityHasComponent(sheepId, "minecraft:is_sheared", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(sheepId, entityLoc, true);
  test.succeedWhenEntityHasComponent(sheepId, "minecraft:is_sheared", entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_shears_mooshroom", (test) => {
  const cowId = "minecraft:cow<minecraft:ageable_grow_up>";
  const mooshroomId = "minecraft:mooshroom<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(mooshroomId, entityLoc);
  test.assertEntityPresent(mooshroomId, entityLoc, true);
  test.assertEntityHasComponent(mooshroomId, "minecraft:is_sheared", entityLoc, false);
  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhenEntityPresent(cowId, entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_shears_snowgolem", (test) => {
  const snowGolemId = "minecraft:snow_golem";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(snowGolemId, entityLoc);
  test.assertEntityPresent(snowGolemId, entityLoc, true);
  test.assertEntityHasComponent(snowGolemId, "minecraft:is_sheared", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(snowGolemId, entityLoc, true);
  test.succeedWhenEntityHasComponent(snowGolemId, "minecraft:is_sheared", entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_horsearmor_on_horse", (test) => {
  const horseId = "minecraft:horse<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const horse = test.spawn(horseId, entityLoc);
  horse.getComponent(tameMountComponentName).setTamed(false);

  test.assertEntityHasArmor(horseId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(horseId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasArmor(horseId, armorSlotTorso, "diamond_horse_armor", 0, entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_saddle_on_pig", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, entityLoc);
  test.assertEntityHasComponent(pigId, "minecraft:is_saddled", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(pigId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(pigId, "minecraft:is_saddled", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_saddle_on_horse", (test) => {
  const horseId = "minecraft:horse<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const horse = test.spawn(horseId, entityLoc);
  test.assertEntityInstancePresent(horse, entityLoc);
  horse.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasComponent(horseId, "minecraft:is_saddled", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(horseId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(horseId, "minecraft:is_saddled", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_chest_on_llama", (test) => {
  const llamaId = "minecraft:llama<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const llama = test.spawn(llamaId, entityLoc);
  llama.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasComponent(llamaId, "minecraft:is_chested", entityLoc, false);
  test.assertEntityHasArmor(llamaId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(llamaId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(llamaId, "minecraft:is_chested", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_carpet_on_llama", (test) => {
  const llamaId = "minecraft:llama<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const llama = test.spawn(llamaId, entityLoc);
  llama.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasArmor(llamaId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(llamaId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasArmor(llamaId, armorSlotTorso, "minecraft:carpet", pinkCarpet, entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

function dispenserMinecartTest(test, entityId) {
  const minecartPos = new BlockLocation(1, 2, 1);
  test.assertEntityPresent(entityId, minecartPos, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityPresent(entityId, minecartPos, true);
  });
}

GameTest.register("DispenserTests", "dispenser_minecart_track", (test) => {
  dispenserMinecartTest(test, "minecraft:minecart");
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_minecart", (test) => {
  dispenserMinecartTest(test, "minecraft:item");
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_water", (test) => {
  const waterPos = new BlockLocation(1, 2, 1);
  const dispenserPos = new BlockLocation(0, 2, 1);
  test.assertBlockPresent(MinecraftBlockTypes.water, waterPos, false);
  test.assertContainerContains(new ItemStack(MinecraftItemTypes.waterBucket, 1, 0), dispenserPos);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhen(() => {
    test.assertContainerContains(new ItemStack(MinecraftItemTypes.bucket, 1, 0), dispenserPos);
    test.assertBlockPresent(MinecraftBlockTypes.water, waterPos, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_arrow_trap", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const sheepPos = new BlockLocation(4, 2, 2);
  test.spawn(sheepId, sheepPos);
  test.assertEntityPresent(sheepId, sheepPos, true);
  test.pullLever(new BlockLocation(2, 3, 2));
  test.succeedWhenEntityPresent(sheepId, sheepPos, false);
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_charge_respawn_anchor", (test) => {
  const testEx = new GameTestExtensions(test);
  test.pressButton(new BlockLocation(0, 2, 0));
  const respawnAnchorPos = new BlockLocation(1, 2, 1);
  const dispenserPos = new BlockLocation(0, 2, 1);
  test.assertContainerContains(new ItemStack(MinecraftItemTypes.glowstone, 1, 0), dispenserPos);

  testEx.assertBlockProperty("respawn_anchor_charge", 0, respawnAnchorPos);
  test.succeedWhen(() => {
    testEx.assertBlockProperty("respawn_anchor_charge", 1, respawnAnchorPos);
    test.assertContainerEmpty(dispenserPos);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_fire", (test) => {
  test.pullLever(new BlockLocation(2, 5, 1));
  const firePositions = [
    new BlockLocation(2, 2, 1),
    new BlockLocation(2, 4, 0),
    new BlockLocation(4, 5, 1),
    new BlockLocation(0, 5, 1),
    new BlockLocation(2, 5, 3),
    new BlockLocation(2, 7, 1),
  ];

  test.succeedWhen(() => {
    for (const pos of firePositions) {
      test.assertBlockPresent(MinecraftBlockTypes.fire, pos, true);
    }
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

// Regression test for crash when dispensing fire MC-210622
GameTest.register("DispenserTests", "dispenser_fire_crash", (test) => {
  test.pullLever(new BlockLocation(0, 2, 0));
  test.succeedOnTick(50);
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);
