import * as GameTest from "mojang-gametest";
import { BlockLocation, Location, MinecraftBlockTypes, ItemStack } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("PistonTests", "honey_block_entity_drag_sideways", (test) => {
  const startPos = new BlockLocation(3, 4, 1);
  const endPos = new BlockLocation(2, 4, 1);
  const pullLeverPos = new BlockLocation(0, 3, 0);
  const chickenEntityType = "minecraft:chicken";

  test.assertEntityPresent(chickenEntityType, endPos, false);
  test.spawn(chickenEntityType, startPos);
  test
    .startSequence()
    .thenExecuteAfter(1, () => {
      test.pullLever(pullLeverPos);
    })
    .thenWait(() => {
      test.assertEntityPresent(chickenEntityType, endPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "quasiconnectivity", (test) => {
  const topStartPos = new BlockLocation(3, 3, 0);
  const bottomStartPos = new BlockLocation(3, 2, 0);
  const topEndPos = new BlockLocation(2, 3, 0);
  const bottomEndPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 4, 0);

  test.pullLever(pullLeverPos);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topStartPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomStartPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLever);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topEndPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomEndPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //There are version differences. Java version has a switch, which can control one piston at the same time, while bedrock version can only control one piston. All the structures have been modified, and the pull rod and its coordinates have been changed to (0, 3, 0) ,next to "quasiconnectivity_bedrock"

GameTest.register("PistonTests", "quasiconnectivity_bedrock", (test) => {
  const topStartPos = new BlockLocation(3, 3, 0);
  const bottomStartPos = new BlockLocation(3, 2, 0);
  const topEndPos = new BlockLocation(2, 3, 0);
  const bottomEndPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.pullLever(pullLeverPos); //There are version differences. Java version has a switch, which can control one piston at the same time, while bedrock version can only control one piston. All the structures have been modified, and the pull rod and its coordinates have been changed to (0, 3, 0)

  test
    .startSequence()
    .thenIdle(6) //it's not possible to time it exactly due to redstone differences then you can just pull the lever, wait 6 ticks, assert, pull, wait 6, assert.
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topStartPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomStartPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topEndPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomEndPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "redstone_simple_vertical_bud", (test) => {
  const blockPos = new BlockLocation(0, 5, 0);
  const setblockPos = new BlockLocation(0, 1, 0);
  test.setBlockType(MinecraftBlockTypes.stone, setblockPos);

  test
    .startSequence()
    .thenIdle(3)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenIdle(1)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "redstone_simple_horizontal_bud", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 1, 0));

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, retractedPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "redstone_bud", (test) => {
  const blockPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 4, 0);
  test.pullLever(pullLeverPos);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenWait(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenSucceed();
})
  .setupTicks(10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "slime_block_pull", (test) => {
  const targetPos = new BlockLocation(3, 3, 0);
  const pullLeverPos = new BlockLocation(0, 4, 0);

  test.assertBlockPresent(MinecraftBlockTypes.planks, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhenBlockPresent(MinecraftBlockTypes.planks, targetPos, true);
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "normal_extend", (test) => {
  const targetPos = new BlockLocation(3, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "normal_extend_retract", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.pistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:normal_extend")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called normal_extend_retract_bedrock.

GameTest.register("PistonTests", "normal_extend_retract_bedrock", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.pistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(4)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:normal_extend")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "sticky_extend", (test) => {
  const targetPos = new BlockLocation(3, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "sticky_extend_retract", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:sticky_extend")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called sticky_extend_retract_bedrock.

GameTest.register("PistonTests", "sticky_extend_retract_bedrock", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:sticky_extend")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "push_limit", (test) => {
  const underLimitTip = new BlockLocation(0, 2, 6);
  const overLimitTip = new BlockLocation(2, 2, 6);
  const pullLeverPos = new BlockLocation(1, 2, 0);
  const underLimitExtendedTip = new BlockLocation(0, 2, 7);

  test.assertBlockPresent(MinecraftBlockTypes.goldBlock, underLimitTip, true);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, overLimitTip, true);
  test.pullLever(pullLeverPos);

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.goldBlock, underLimitExtendedTip, true);
    test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, overLimitTip, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "block_leave", (test) => {
  const trigger = new BlockLocation(3, 1, 1);
  const retracted = new BlockLocation(1, 1, 1);
  const extended = new BlockLocation(0, 1, 1);

  test.pulseRedstone(trigger, 2);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retracted, true);
    })
    .thenExecuteAfter(3, () => {
      test.pulseRedstone(trigger, 2);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extended, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java Edition, pistons finish extending early and start retracting if given a pulse shorter than 3 game ticks (1.5 redstone ticks; 0.15 seconds). These shorter pulses cause sticky pistons to "drop" their block, leaving it behind when trying to push it with a short pulse. Also, this causes the block to end up in its final position earlier.Therefore, the bedrock version can't be modified, and can only be verified according to the piston tension,

GameTest.register("PistonTests", "block_leave_bedrock", (test) => {
  const trigger = new BlockLocation(3, 1, 1);
  const retracted = new BlockLocation(1, 1, 1);
  const extended = new BlockLocation(0, 1, 1);

  test.pulseRedstone(trigger, 2);
  test
    .startSequence()
    .thenIdle(1)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retracted, true);
    })
    .thenExecuteAfter(3, () => {
      test.pulseRedstone(trigger, 2);
    })
    .thenIdle(5)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extended, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "update_order", (test) => {
  const posA = new BlockLocation(2, 1, 1);
  const posB = new BlockLocation(2, 1, 0);
  const posC = new BlockLocation(3, 1, 0);
  const posD = new BlockLocation(1, 1, 0);

  const trigger = new BlockLocation(6, 2, 2);
  test.setBlockType(trigger, MinecraftBlockTypes.greenWool);

  test
    .startSequence()
    .thenWaitAfter(4, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posB, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.blueWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posC, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.purpleWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posD, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.cyanWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posA, true);
    })
    .thenSucceed();
})
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Due to redstone differences, create a new test called update_order_bedrock. Also, use colored glazed terracotta instead of missing colored wool blocks.

GameTest.register("PistonTests", "update_order_bedrock", (test) => {
  const posA = new BlockLocation(2, 1, 1);
  const posB = new BlockLocation(2, 1, 0);
  const posC = new BlockLocation(3, 1, 0);
  const posD = new BlockLocation(1, 1, 0);

  const trigger = new BlockLocation(6, 2, 2);
  test.setBlockType(MinecraftBlockTypes.greenGlazedTerracotta, trigger);
  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posB, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.blueGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posC, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.purpleGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posD, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.cyanGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posA, true);
    })
    .thenSucceed();
})

  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed as block position doesn't update with the right order.

GameTest.register("PistonTests", "double_extender", (test) => {
  const pullLeverPos = new BlockLocation(2, 3, 2);
  const blockPresentPosA = new BlockLocation(0, 2, 2);
  const blockPresentPosB = new BlockLocation(0, 2, 4);

  test.pullLever(pullLeverPos);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);

  test
    .startSequence()
    .thenWaitAfter(11, () => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosB, true);
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(12, () => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called double_extender_bedrock.

GameTest.register("PistonTests", "double_extender_bedrock", (test) => {
  const pullLeverPos = new BlockLocation(2, 3, 2);
  const blockPresentPosA = new BlockLocation(0, 2, 2);
  const blockPresentPosB = new BlockLocation(0, 2, 4);

  test.pullLever(pullLeverPos);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosB, true);
      test.pullLever(pullLeverPos);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:double_extender")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "triple_extender", (test) => {
  const retracted = new BlockLocation(0, 4, 4);
  const extended = new BlockLocation(0, 1, 4);
  const trigger = new BlockLocation(0, 8, 0);
  const assertBlockPresentA = new BlockLocation(0, 7, 4);
  const assertBlockPresentB = new BlockLocation(0, 6, 4);
  const assertBlockPresentC = new BlockLocation(0, 5, 4);

  test.pressButton(trigger);

  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentB, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
    })
    .thenIdle(20)
    .thenWait(() => {
      test.pressButton(trigger);
    })
    .thenIdle(42)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentA(), true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentB(), true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentC(), true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Game parity issue. Create a new test called triple_extender_bedrock using new structure, and updated piston react time.

GameTest.register("PistonTests", "triple_extender_bedrock", (test) => {
  const retracted = new BlockLocation(0, 4, 4);
  const extended = new BlockLocation(0, 1, 4);
  const trigger = new BlockLocation(0, 7, 0);
  const assertBlockPresentA = new BlockLocation(0, 7, 4);
  const assertBlockPresentB = new BlockLocation(0, 6, 4);
  const assertBlockPresentC = new BlockLocation(0, 5, 4);
  const assertBlockPresentD = new BlockLocation(0, 3, 4);
  test.pressButton(trigger);
  test
    .startSequence()
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentD, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentB, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
    })
    .thenSucceed();
})
  .setupTicks(20)
  .tag(GameTest.Tags.suiteDefault)
  .maxTicks(100);

GameTest.register("PistonTests", "monostable", (test) => {
  const testEx = new GameTestExtensions(test);
  const lampPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 2, 0);

  testEx.assertBlockProperty("redstone_signal", 0, lampPos);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("redstone_signal", 1, lampPos);
    })
    .thenWaitAfter(4, () => {
      testEx.assertBlockProperty("redstone_signal", 0, lampPos);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //quasi connectivity problem: when the repeater is in the upper right corner of the piston, the bedrock piston will not stretch, but Java will stretch

GameTest.register("PistonTests", "monostable_bedrock", (test) => {
  const lampPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 2, 0);

  test.assertRedstonePower(lampPos, 0);

  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenExecuteAfter(8, () => {
      test.assertRedstonePower(lampPos, 15);
    })
    .thenExecuteAfter(8, () => {
      test.assertRedstonePower(lampPos, 0);
    })
    .thenSucceed();
})
  .maxTicks(100)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "instant_retraction", (test) => {
  const airPos = new BlockLocation(2, 1, 1);
  const concretePos = new BlockLocation(0, 1, 3);

  test.setBlockType(MinecraftBlockTypes.air, airPos);
  test.succeedOnTickWhen(14, () => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, concretePos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "instant_repeater", (test) => {
  const testEx = new GameTestExtensions(test);
  const triggerPos = new BlockLocation(0, 3, 0);
  const outputPos = new BlockLocation(0, 3, 25);
  test.pullLever(triggerPos);

  test
    .startSequence()
    .thenWaitAfter(1, () => {
      testEx.assertBlockProperty("redstone_signal", 1, outputPos);
    })
    .thenIdle(10) // relaxation time
    .thenExecute(() => {
      test.pullLever(triggerPos);
    })
    .thenWaitAfter(5, () => {
      testEx.assertBlockProperty("redstone_signal", 0, outputPos);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Instant repeaters rely on block update detection due to quasi-connectivity and cannot be built in Bedrock.

GameTest.register("PistonTests", "entity_backside", (test) => {
  const buttonPos = new BlockLocation(2, 2, 0);
  const lampFailPos = new BlockLocation(4, 3, 2);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneLamp, lampFailPos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "redstone_matrix", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const wirePos = new BlockLocation(1, 4, 2);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneWire, wirePos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "one_tick_pulse", (test) => {
  const retractedPos = new BlockLocation(1, 2, 3);
  const extendedPos = new BlockLocation(0, 2, 3);
  const pressButtonPos = new BlockLocation(2, 2, 0);

  test.pressButton(pressButtonPos);

  test
    .startSequence()

    .thenWaitAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, extendedPos, true);
    })
    .thenIdle(30)
    .thenWait(() => {
      test.pressButton(pressButtonPos);
    })
    .thenWaitAfter(4, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //It's Gameplay differences. In Java Edition, pistons finish extending early and start retracting if given a pulse shorter than 3 game ticks, this causes the block to end up in its final position earlier.

GameTest.register("PistonTests", "one_tick_pulse_bedrock", (test) => {
  const retractedPos = new BlockLocation(1, 2, 3);
  const extendedPos = new BlockLocation(0, 2, 3);
  const pressButtonPos = new BlockLocation(2, 2, 0);

  test.pressButton(pressButtonPos);

  test
    .startSequence()
    .thenIdle(2)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, extendedPos, true);
    })
    .thenIdle(30)
    .thenWait(() => {
      test.pressButton(pressButtonPos);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "backside", (test) => {
  var buttonsBlockPos = [
    new BlockLocation(3, 3, 0),
    new BlockLocation(1, 2, 1),
    new BlockLocation(4, 3, 3),
    new BlockLocation(1, 4, 3),
    new BlockLocation(3, 3, 6),
    new BlockLocation(0, 3, 5),
  ];

  for (const buttonPos of buttonsBlockPos) {
    test.pressButton(buttonPos);
  }
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      for (const buttonPos of buttonsBlockPos) {
        test.assertBlockPresent(MinecraftBlockTypes.stoneButton, buttonPos, true);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "observer_retraction_timing", (test) => {
  const testEx = new GameTestExtensions(test);
  const levelPos = new BlockLocation(3, 2, 2);
  const observerPos = new BlockLocation(2, 2, 1);
  test.pullLever(levelPos);
  test
    .startSequence()
    .thenExecute(() => {
      testEx.assertBlockProperty("powered_bit", 0, observerPos);
    })
    .thenIdle(2)
    .thenExecute(() => {
      testEx.assertBlockProperty("powered_bit", 1, observerPos);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "random_tick_forcer", (test) => {
  const buttonPos = new BlockLocation(1, 3, 0);
  const flower = new BlockLocation(1, 3, 6);
  const aboveFlower = new BlockLocation(1, 4, 6);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(20)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.chorusFlower, flower, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, aboveFlower, true);
    })
    .thenSucceed();
})
  .batch("no_random_ticks")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The parity problem is still being solved

GameTest.register("PistonTests", "random_tick_forcer_bedrock", (test) => {
  const buttonPos = new BlockLocation(1, 3, 0);
  const flower = new BlockLocation(1, 3, 6);
  const aboveFlower = new BlockLocation(1, 4, 6);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.chorusFlower, flower, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, aboveFlower, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDisabled);

GameTest.register("PistonTests", "honey_block_entity_drag_down", (test) => {
  const leverPos = new BlockLocation(1, 1, 0);
  const entityTypePos = new BlockLocation(1, 4, 1);
  const cowId = "minecraft:cow<minecraft:ageable_grow_up>";
  const entityTouchingPos = new Location(1.5, 4.5, 1.5);
  const entityNotTouchingTypePos = new Location(1.5, 3.5, 1.5);

  test.spawn(cowId, entityTypePos);
  test.assertEntityTouching(cowId, entityTouchingPos, true);
  test.assertEntityTouching(cowId, entityNotTouchingTypePos, false);

  const timeBetweenEachLeverPull = 4;

  var startSequence = test
    .startSequence()
    .thenIdle(4)
    .thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    });
  startSequence;

  for (var i = 0; i < 10; i++) {
    startSequence.thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    });
  }

  startSequence
    .thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    })
    .thenWait(() => {
      test.assertEntityTouching(cowId, entityTouchingPos, true);
      test.assertEntityTouching(cowId, entityNotTouchingTypePos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "backside_fence", (test) => {
  const centerPos = new BlockLocation(2, 2, 2);
  test.setBlockType(MinecraftBlockTypes.fence, centerPos);

  test.startSequence().thenIdle(30).thenSucceed();
  let connectivity = undefined;

  test
    .startSequence()
    .thenIdle(1)
    .thenExecute(() => {
      connectivity = test.getFenceConnectivity(centerPos);
      test.assert(
        connectivity.east && connectivity.west && connectivity.north && connectivity.south,
        "Fence should connect to pistons"
      );
    })
    .thenWait(() => {
      connectivity = test.getFenceConnectivity(centerPos);
      test.assert(
        !(connectivity.east && connectivity.west && connectivity.north && connectivity.south),
        "Fence should stay connected to pistons"
      );
    })
    .thenFail("Fence didn't stay connected to pistons");
}).tag(GameTest.Tags.suiteDefault);
