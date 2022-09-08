import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, Direction } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("MinecartTests", "turn", (test) => {
  const minecartEntityType = "minecart";

  const endPos = new BlockLocation(1, 2, 2);
  const startPos = new BlockLocation(1, 2, 0);

  test.assertEntityPresent(minecartEntityType, startPos, true);
  test.assertEntityPresent(minecartEntityType, endPos, false);

  test.pressButton(new BlockLocation(0, 3, 0));

  test.succeedWhenEntityPresent(minecartEntityType, endPos, true);
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MinecartTests", "furnace_corner", (test) => {
  const furnaceMinecart = "furnace_minecart";

  const endPos = new BlockLocation(2, 2, 1);
  const startPos = new BlockLocation(1, 2, 0);

  test.assertEntityPresent(furnaceMinecart, startPos, true);

  test.succeedWhenEntityPresent(furnace_minecart, endPos, true);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "detector_rail_slope", (test) => {
  const testEx = new GameTestExtensions(test);
  const poweredDetectorPos = new BlockLocation(2, 2, 1);
  let ascendingValue = null;
  switch (test.getTestDirection()) {
    case Direction.east:
      ascendingValue = 2;
      break;
    case Direction.west:
      ascendingValue = 3;
      break;
    case Direction.north:
      ascendingValue = 4;
      break;
    case Direction.south:
      ascendingValue = 5;
      break;
  }
  test.assertBlockPresent(MinecraftBlockTypes.detectorRail, poweredDetectorPos, true);
    
  testEx.assertBlockProperty("rail_direction", ascendingValue, poweredDetectorPos);

  test.pressButton(new BlockLocation(0, 3, 3));
  test.runAfterDelay(20, () => {
    test.succeedWhen(() => {
      test.assertBlockPresent(MinecraftBlockTypes.detectorRail, poweredDetectorPos, true);
      testEx.assertBlockProperty("rail_direction", ascendingValue, poweredDetectorPos);
    });
  });
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);
  
 GameTest.register("MinecartTests", "detector_rail_piston", (test) => {
  const pistonRight = new BlockLocation(5, 3, 0);
  const pistonLeft = new BlockLocation(0, 3, 0);
  const torchRight = new BlockLocation(3, 2, 0);
  const torchLeft = new BlockLocation(2, 2, 0);

  let minecart = undefined;
  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(pistonRight, 1))
    .thenExecuteAfter(3, () => test.pulseRedstone(pistonLeft, 1))
    .thenExecuteAfter(3, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
      minecart = test.spawn("minecart", new BlockLocation(3, 3, 1));
    })
    .thenExecuteAfter(3, () => {
      test.assertRedstonePower(torchRight, 0);
      test.pulseRedstone(pistonRight, 1);
    })
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 0);
      test.pulseRedstone(pistonLeft, 1);
    })
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 0);
      test.assertRedstonePower(torchLeft, 15);
      minecart.kill();
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
    })
    .thenSucceed();
})
  .required(false)
  .tag("suite:java_parity") //Redstone timing inconsistencies between java and bedrock.
  .tag(GameTest.Tags.suiteDisabled); 

GameTest.register("MinecartTests", "detector_rail_piston_bedrock", (test) => {
  const pistonRight = new BlockLocation(5, 3, 0);
  const pistonLeft = new BlockLocation(0, 3, 0);
  const torchRight = new BlockLocation(3, 2, 0);
  const torchLeft = new BlockLocation(2, 2, 0);

  let minecart = undefined;
  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(pistonRight, 4))
    .thenIdle(2)
    .thenExecuteAfter(3, () => test.pulseRedstone(pistonLeft, 4))
    .thenIdle(2)
    .thenWait(() => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
      minecart = test.spawnAtLocation("minecart", new Location(3, 3.35, 1));
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 0);
      test.pulseRedstone(pistonRight, 4);
    })
    .thenIdle(2)
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 0);
      test.pulseRedstone(pistonLeft, 4);
    })
    .thenIdle(2)
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 0);
      test.assertRedstonePower(torchLeft, 15);
      minecart.kill();
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
    })
    .thenSucceed();
})
  .setupTicks(20)
  .required(false)
  .tag("suite:java_parity") //Failed due to two game parity issues: 1.When the piston pushes the minecart, the minecart will overlap with the stone. 2.After the piston pushes the minecart back and forth several times, kill the minecart, the powered status of detector rail doesn't disappear.
  .tag(GameTest.Tags.suiteDisabled);

function runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, entityType) {
  test.assertEntityPresent(entityType, dryTrackEndPos, false);
  test.assertEntityPresent(entityType, wetTrackEndPos, false);

  test.pressButton(buttonPos);

  test
    .startSequence()
    .thenWait(() => test.assertEntityPresent(entityType, dryTrackEndPos), true)
    .thenExecute(() => test.assertEntityPresent(entityType, wetTrackEndPos), false)
    .thenWait(() => test.assertEntityPresent(entityType, wetTrackEndPos), true)
    .thenSucceed();
}

function runWaterSlowdown(test, entityType) {
  const buttonPos = new BlockLocation(1, 4, 2);
  const dryTrackEndPos = new BlockLocation(8, 3, 1);
  const wetTrackEndPos = new BlockLocation(8, 3, 3);

  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, entityType);
}

GameTest.register("MinecartTests", "water_slowdown", (test) => {
  runWaterSlowdown(test, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_occupied_cart", (test) => {
  runWaterSlowdown(test, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_tnt_cart", (test) => {
  runWaterSlowdown(test, "tnt_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the tnt_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_hopper_cart", (test) => {
  runWaterSlowdown(test, "hopper_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the hopper_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_chest_cart", (test) => {
  runWaterSlowdown(test, "chest_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the chest_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_commandblock_cart", (test) => {
  runWaterSlowdown(test, "command_block_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the command_block_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_furnace_cart", (test) => {
  const buttonPos = new BlockLocation(1, 4, 4);
  const dryTrackEndPos = new BlockLocation(7, 3, 1);
  const wetTrackEndPos = new BlockLocation(7, 3, 7);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_vertical", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(3, 2, 1);
  const wetTrackEndPos = new BlockLocation(3, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_vertical_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(3, 2, 1);
  const wetTrackEndPos = new BlockLocation(3, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_slope_down", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(6, 2, 1);
  const wetTrackEndPos = new BlockLocation(6, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_slope_down_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(6, 2, 1);
  const wetTrackEndPos = new BlockLocation(6, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_slope_up", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 5, 0);
  const wetTrackEndPos = new BlockLocation(7, 5, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_rail", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 5, 0);
  const wetTrackEndPos = new BlockLocation(7, 5, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_rail_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 2, 0);
  const wetTrackEndPos = new BlockLocation(7, 2, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock
