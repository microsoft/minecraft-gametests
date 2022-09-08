import * as GameTest from "mojang-gametest";
import { MinecraftItemTypes, ItemStack, MinecraftEnchantmentTypes, Enchantment } from "mojang-minecraft";

GameTest.register("ItemEnchantmentsTests", "item_get_enchantments_component", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");

  test.assert(enchantsComponent != undefined, "Enchantments component should not be null");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "item_can_have_enchantments_applied", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  let addSuccess = enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 2));
  test.assert(addSuccess, "Should have been able to add fire aspect enchantment to empty list");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "item_enchantments_conflict_prevent_adding", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 2));
  let addSuccess = enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.aquaAffinity, 1));

  test.assert(addSuccess == false, "Expected failure to add armor enchantment to sword");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "get_all_enchantments", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 1));
  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.baneOfArthropods, 2));
  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.knockback));

  let allEnchantments = Array.from(enchantments); // test the iterator
  test.assert(allEnchantments.length == 3, "Expected 3 enchantments");
  test.assert(allEnchantments[0].type.id == "fireAspect", "Expected fire aspect enchantment");
  test.assert(allEnchantments[0].level == 1, "Expected fire aspect enchantment level 1");
  test.assert(allEnchantments[1].type.id == "baneOfArthropods", "Expected bane of arthropods enchantment");
  test.assert(allEnchantments[1].level == 2, "Expected bane of arthropods enchantment level 2");
  test.assert(allEnchantments[2].type.id == "knockback", "Expected knockback enchantment");
  test.assert(allEnchantments[2].level == 1, "Expected knockback enchantment level 1");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);
