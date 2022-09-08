import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, ItemStack, world } from "mojang-minecraft";

GameTest.register("DebugTests", "always_fail", (test) => {
  // Do nothing, let the test time out
})
  .maxTicks(50)
  .tag(GameTest.Tags.suiteDebug);

GameTest.register("DebugTests", "always_succeed", (test) => {
  test.runAfterDelay(40, () => {
    test.succeed();
  });
})
  .maxTicks(50)
  .tag(GameTest.Tags.suiteDebug);

GameTest.register("DebugTests", "stack_overflow", (test) => {
  let player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "stack_overflow");
  let apple = new ItemStack(MinecraftItemTypes.apple);
  let eventCallback = world.events.beforeItemUse.subscribe((eventData) => {
    player.useItem(apple);
  });
  player.useItem(apple);
  world.events.beforeItemUse.unsubscribe(eventCallback);
  test.succeed();
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_succeed");

GameTest.register("DebugTests", "perf_hang", (test) => {
  console.warn("infinite loop");
  while (true) {}
  test.fail();
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_succeed");

GameTest.register("DebugTests", "perf_slow", (test) => {
  console.warn("7 ms delay each frame");
  let tickEvent = world.events.tick.subscribe((eventData) => {
    const start = Date.now();
    while (Date.now() - start < 7) {}
  });
  test.runAfterDelay(80, () => {
    world.events.tick.unsubscribe(tickEvent);
    test.succeed();
  });
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_succeed");

GameTest.register("DebugTests", "perf_spike", (test) => {
  console.warn("150 ms delay");
  const start = Date.now();
  while (Date.now() - start < 150) {}
  test.succeed();
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_succeed");

GameTest.register("DebugTests", "out_of_memory", (test) => {
  let buffer = new ArrayBuffer(250000000); // 250MB
  test.fail("Test should have ran out of memory");
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_fail");

GameTest.register("DebugTests", "high_memory_usage", (test) => {
  let buffer = new ArrayBuffer(100000000); // 100MB
  buffer.a = buffer; // circular reference
  test.succeed();
})
  .tag(GameTest.Tags.suiteDebug)
  .structureName("DebugTests:always_succeed");
