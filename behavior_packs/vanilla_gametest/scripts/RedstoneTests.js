import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftItemTypes, BlockProperties, world } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TicksPerSecond = 20;

const LEVEL_TO_RECORDS = new Map([
  [0, MinecraftItemTypes.air],
  [1, MinecraftItemTypes.musicDisc13],
  [2, MinecraftItemTypes.musicDiscCat],
  [3, MinecraftItemTypes.musicDiscBlocks],
  [4, MinecraftItemTypes.musicDiscChirp],
  [5, MinecraftItemTypes.musicDiscFar],
  [6, MinecraftItemTypes.musicDiscMall],
  [7, MinecraftItemTypes.musicDiscMellohi],
  [8, MinecraftItemTypes.musicDiscStal],
  [9, MinecraftItemTypes.musicDiscStrad],
  [10, MinecraftItemTypes.musicDiscWard],
  [11, MinecraftItemTypes.musicDisc11],
  [12, MinecraftItemTypes.musicDiscWait],
  [13, MinecraftItemTypes.musicDiscPigstep],
]);

GameTest.register("RedstoneTests", "itemframe_override", (test) => {
  const itemFrameTest = new BlockLocation(3, 2, 5);
  const itemFrameOverrideNoTest = new BlockLocation(3, 2, 10);

  const lever = new BlockLocation(1, 2, 0);
  const leverOverrideTest = new BlockLocation(1, 2, 13);

  test.assertRedstonePower(itemFrameTest, 1);
  test.assertRedstonePower(itemFrameOverrideNoTest, 1);

  test.pullLever(lever);

  test.succeedWhen(() => {
    test.assertRedstonePower(leverOverrideTest, 1);
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Torches can't be placed on item frames in Bedrock,When the bow and arrow are placed on the item frame, it cannot be linked with red stone. So I changed the location of the red stone link to bedrock

GameTest.register("RedstoneTests", "itemframe_override_bedrock", (test) => {
  const itemFrameTest = new BlockLocation(3, 2, 5);
  const itemFrameOverrideNoTest = new BlockLocation(2, 2, 10);

  const lever = new BlockLocation(1, 2, 0);
  const leverOverrideTest = new BlockLocation(0, 2, 13);

  test
    .startSequence()
    .thenIdle(3)
    .thenExecute(() => {
      test.assertRedstonePower(itemFrameTest, 1);
      test.assertRedstonePower(itemFrameOverrideNoTest, 1);
    })
    .thenExecute(() => {
      test.pullLever(lever);
    })
    .thenIdle(10)
    .thenExecute(() => {
      test.assertRedstonePower(leverOverrideTest, 3);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "comparator_container", (test) => {
  const aLeft = new BlockLocation(6, 2, 2);
  const aRight = new BlockLocation(1, 2, 2);

  test.assertRedstonePower(aLeft, 14);
  test.assertRedstonePower(aRight, 15);

  const bLeft = new BlockLocation(6, 2, 7);
  const bRight = new BlockLocation(1, 2, 7);

  test.assertRedstonePower(bLeft, 0);
  test.assertRedstonePower(bRight, 15);

  const cLeft = new BlockLocation(6, 2, 13);
  const cRight = new BlockLocation(1, 2, 13);
  test.assertRedstonePower(cLeft, 1);
  test.assertRedstonePower(cRight, 15);

  test.succeed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // In the bedrock version, the chest is next to the square, causing the red stone signal to fail to transmit

GameTest.register("RedstoneTests", "comparator_container_bedrock", (test) => {
  const aLeft = new BlockLocation(6, 2, 2);
  const aRight = new BlockLocation(1, 2, 2);
  const bLeft = new BlockLocation(6, 2, 7);
  const bRight = new BlockLocation(1, 2, 7);
  const cLeft = new BlockLocation(6, 2, 13);
  const cRight = new BlockLocation(1, 2, 13);

  test.succeedWhen(() => {
    test.assertRedstonePower(aLeft, 14);
    test.assertRedstonePower(aRight, 15);
    test.assertRedstonePower(bLeft, 0);
    test.assertRedstonePower(bRight, 0);
    test.assertRedstonePower(cLeft, 0);
    test.assertRedstonePower(cRight, 0);
  });
})
  .structureName("RedstoneTests:comparator_container")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "wireredirect_nonconductor", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(3, 2, 0), new BlockLocation(1, 2, 0)];
  const fenceGatesClosed = [
    new BlockLocation(2, 3, 0),
    new BlockLocation(2, 3, 2),
    new BlockLocation(1, 2, 2),
    new BlockLocation(2, 2, 2),
    new BlockLocation(3, 2, 2),
    new BlockLocation(0, 2, 1),
    new BlockLocation(4, 2, 1),
  ];
  const fenceGatesOpen = [new BlockLocation(3, 3, 1), new BlockLocation(1, 3, 1)];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
      for (const fenceGateC of fenceGatesClosed) {
        testEx.assertBlockProperty("open_bit", 0, fenceGateC);
      }
      for (const fenceGateO of fenceGatesOpen) {
        testEx.assertBlockProperty("open_bit", 1, fenceGateO);
      }
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // There is no way to judge the opening and closing state of the fence door, so in is used in open_bit

GameTest.register("RedstoneTests", "wireredirect_nonconductor_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(3, 2, 0), new BlockLocation(1, 2, 0)];
  const fenceGatesClosed = [
    new BlockLocation(2, 3, 0),
    new BlockLocation(2, 3, 2),
    new BlockLocation(1, 2, 2),
    new BlockLocation(2, 2, 2),
    new BlockLocation(3, 2, 2),
    new BlockLocation(0, 2, 1),
    new BlockLocation(4, 2, 1),
  ];
  const fenceGatesOpen = [new BlockLocation(3, 3, 1), new BlockLocation(1, 3, 1)];

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const fenceGateC of fenceGatesClosed) {
        testEx.assertBlockProperty("open_bit", 0, fenceGateC);
      }
    })
    .thenExecute(() => {
      for (const fenceGateO of fenceGatesOpen) {
        testEx.assertBlockProperty("open_bit", 1, fenceGateO);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_regeneration", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const inactiveOutput = new BlockLocation(6, 3, 4);
  const activeOutput = new BlockLocation(6, 3, 3);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, input);
  test.succeedWhen(() => {
    testEx.assertBlockProperty("open_bit", 0, inactiveOutput);
    testEx.assertBlockProperty("open_bit", 1, activeOutput);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_lock", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 2);
  const lock = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, input);

  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, lock);
      test.setBlockType(MinecraftBlockTypes.air, input);
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecuteAfter(2, () => {
      test.setBlockType(MinecraftBlockTypes.air, lock);
    })
    .thenIdle(4)
    .thenExecute(() => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_monostable", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.pressButton(input);
  test
    .startSequence()
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.failIf(() => {
        testEx.assertBlockProperty("open_bit", 0, output);
      });
    })
    .thenWait(() => {
      testEx.assertBlockProperty("button_pressed_bit", 0, input);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // there are tick delay differences between Java and Bedrock.

GameTest.register("RedstoneTests", "torch_monostable_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.pressButton(input);

  test
    .startSequence()
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.failIf(() => {
        testEx.assertBlockProperty("open_bit", 0, output);
      });
    })
    .thenWait(() => {
      testEx.assertBlockProperty("button_pressed_bit", 0, input);
    })
    .thenSucceed();
})
  .setupTicks(2)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "wire_redirect", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(6, 2, 1), new BlockLocation(3, 2, 0), new BlockLocation(0, 2, 1)];
  const wires = [new BlockLocation(5, 2, 4), new BlockLocation(3, 2, 4), new BlockLocation(1, 2, 4)];
  const fenceGates = [
    new BlockLocation(5, 3, 1),
    new BlockLocation(5, 3, 3),
    new BlockLocation(3, 3, 1),
    new BlockLocation(3, 3, 3),
    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 3),
  ];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const wire of wires) {
        test.assertRedstonePower(wire, 0);
      }
    })
    .thenExecute(() => {
      for (const fenceGate of fenceGates) {
        testEx.assertBlockProperty("in_wall_bit", 0, fenceGate);
      }
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Floating fence gates are powered differently

GameTest.register("RedstoneTests", "wire_redirect_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(6, 2, 1), new BlockLocation(3, 2, 0), new BlockLocation(0, 2, 1)];
  const wires = [new BlockLocation(5, 2, 4), new BlockLocation(3, 2, 4), new BlockLocation(1, 2, 4)];
  const fenceGates = [
    new BlockLocation(5, 3, 1),
    new BlockLocation(5, 3, 3),
    new BlockLocation(3, 3, 1),
    new BlockLocation(3, 3, 3),
    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 3),
  ];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const wire of wires) {
        test.assertRedstonePower(wire, 0);
      }
    })
    .thenExecute(() => {
      for (const fenceGate of fenceGates) {
        testEx.assertBlockProperty("in_wall_bit", 0, fenceGate);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

let observerClock = (test, initialOpenBit) => {
  const testEx = new GameTestExtensions(test);
  const outputPos = new BlockLocation(2, 2, 0);

  const blockPermutation = MinecraftBlockTypes.trapdoor.createDefaultBlockPermutation();
  blockPermutation.getProperty(BlockProperties.openBit).value = initialOpenBit;

  test.setBlockPermutation(blockPermutation, outputPos);

  let sequence = test.startSequence();

  sequence.thenWait(() => {
    testEx.assertBlockProperty("open_bit", 1, outputPos);
  });

  for (let i = 0; i < 8; i++) {
    sequence
      .thenWait(() => {
        testEx.assertBlockProperty("open_bit", 0, outputPos);
      })
      .thenWait(() => {
        testEx.assertBlockProperty("open_bit", 1, outputPos);
      });
  }
  sequence.thenSucceed();
};

GameTest.register("RedstoneTests", "observer_clock", (test) => observerClock(test, false))
  .tag("suite:java_parity") // Trapdoors do not always flip open from observer redstone signal when starting closed
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("RedstoneTests", "observer_clock_bedrock", (test) => observerClock(test, true))
  .structureName("RedstoneTests:observer_clock")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_delay_lines", (test) => {
  const inputPos = new BlockLocation(0, 2, 0);

  const linesPos = [
    [new BlockLocation(4, 2, 1), new BlockLocation(4, 2, 2), new BlockLocation(4, 2, 3), new BlockLocation(4, 2, 4)], //4-tick delay
    [new BlockLocation(3, 2, 1), new BlockLocation(3, 2, 2), new BlockLocation(3, 2, 3), new BlockLocation(3, 2, 4)], //3-tick delay
    [new BlockLocation(2, 2, 1), new BlockLocation(2, 2, 2), new BlockLocation(2, 2, 3), new BlockLocation(2, 2, 4)], //2-tick delay
    [new BlockLocation(1, 2, 1), new BlockLocation(1, 2, 2), new BlockLocation(1, 2, 3), new BlockLocation(1, 2, 4)], //1-tick delay
  ];

  const states = [
    "XXX0",
    "XX01",
    "X002",
    "0013",
    "001X",
    "012X",
    null,
    "113X",
    "123X",
    "12XX",
    null,
    "23XX",
    null,
    null,
    "2XXX",
    "3XXX",
    null,
    null,
    null,
    "XXXX",
  ];

  test.pulseRedstone(inputPos, 3);
  const dimension = test.getDimension();

  let sequence = test.startSequence();
  for (const state of states) {
    if (state == null) {
      sequence = sequence.thenIdle(2);
    } else {
      sequence = sequence.thenWaitAfter(2, () => {
        for (let line = 0; line < 4; line++) {
          const expected = state.charAt(line);
          const expectedPos = expected == "X" ? -1 : expected - "0";
          for (let linePos = 0; linePos < 4; linePos++) {
            const blockWorldPos = test.worldBlockLocation(linesPos[line][linePos]);
            const block = dimension.getBlock(blockWorldPos);
            const blockId = block.id;

            if (linePos == expectedPos) {
              test.assert(
                blockId == "minecraft:powered_repeater",
                "Unexpected Block State. Expected: powered. Actual: unpowered"
              );
            } else {
              test.assert(
                blockId == "minecraft:unpowered_repeater",
                "Unexpected Block State. Expected: unpowered. Actual: powered"
              );
            }
          }
        }
      });
    }
  }
  sequence.thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The speed of the redstone pulse is different between Java and Bedrock.

GameTest.register("RedstoneTests", "repeater_delay_lines_bedrock", (test) => {
  const inputPos = new BlockLocation(0, 2, 0);

  const linesPos = [
    [new BlockLocation(4, 2, 1), new BlockLocation(4, 2, 2), new BlockLocation(4, 2, 3), new BlockLocation(4, 2, 4)], //4-tick delay
    [new BlockLocation(3, 2, 1), new BlockLocation(3, 2, 2), new BlockLocation(3, 2, 3), new BlockLocation(3, 2, 4)], //3-tick delay
    [new BlockLocation(2, 2, 1), new BlockLocation(2, 2, 2), new BlockLocation(2, 2, 3), new BlockLocation(2, 2, 4)], //2-tick delay
    [new BlockLocation(1, 2, 1), new BlockLocation(1, 2, 2), new BlockLocation(1, 2, 3), new BlockLocation(1, 2, 4)], //1-tick delay
  ];

  const states = [
    "XXX0",
    "XX01",
    "X002",
    "0013",
    "001X",
    "012X",
    null,
    "113X",
    "123X",
    "12XX",
    null,
    "23XX",
    null,
    null,
    "2XXX",
    "3XXX",
    null,
    null,
    null,
    "XXXX",
  ];

  test.pulseRedstone(inputPos, 3); //Change redstone pulse form 2 ticks to 3.
  const dimension = test.getDimension();

  let sequence = test.startSequence();
  for (const state of states) {
    if (state == null) {
      sequence = sequence.thenIdle(2);
    } else {
      sequence = sequence.thenWait(() => {
        for (let line = 0; line < 4; line++) {
          const expected = state.charAt(line);
          const expectedPos = expected == "X" ? -1 : expected - "0";
          for (let linePos = 0; linePos < 4; linePos++) {
            const blockWorldPos = test.worldBlockLocation(linesPos[line][linePos]);
            const block = dimension.getBlock(blockWorldPos);
            const blockPerm = block.permutation;
            const blockType = blockPerm.type;

            if (linePos == expectedPos) {
              test.assert(
                blockType.id == "minecraft:powered_repeater",
                "Unexpected Block State. Expected: powered. Actual: unpowered"
              );
            } else {
              test.assert(
                blockType.id == "minecraft:unpowered_repeater",
                "Unexpected Block State. Expected: unpowered. Actual: powered"
              );
            }
          }
        }
      });
    }
  }
  sequence.thenSucceed();
})
  .structureName("RedstoneTests:repeater_delay_lines")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_clock", (test) => {
  const testEx = new GameTestExtensions(test);
  const startPos = new BlockLocation(0, 4, 0);
  const stagesPos = [
    new BlockLocation(0, 1, 0),
    new BlockLocation(2, 1, 0),
    new BlockLocation(2, 1, 2),
    new BlockLocation(0, 1, 2),
  ];

  test.pulseRedstone(startPos, 3);

  let sequence = test.startSequence();
  for (let i = 0; i < 32; i++) {
    const active = i % 4;
    sequence = sequence.thenWaitAfter(i == 0 ? 0 : 2, () => {
      for (let b = 0; b < 4; b++) {
        testEx.assertBlockProperty("open_bit", b == active ? 1 : 0, stagesPos[b]);
      }
    });
  }
  sequence.thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The speed of the redstone pulse is different between Java and Bedrock.

GameTest.register("RedstoneTests", "repeater_clock_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const startPos = new BlockLocation(0, 4, 0);
  const stagesPos = [
    new BlockLocation(0, 1, 0),
    new BlockLocation(2, 1, 0),
    new BlockLocation(2, 1, 2),
    new BlockLocation(0, 1, 2),
  ];

  test.pulseRedstone(startPos, 3); //Change redstone pulse form 2 ticks to 3.

  let sequence = test.startSequence();
  for (let i = 0; i < 32; i++) {
    const active = i % 4;
    sequence = sequence.thenWait(() => {
      for (let b = 0; b < 4; b++) {
        testEx.assertBlockProperty("open_bit", b == active ? 1 : 0, stagesPos[b]);
      }
    });
  }
  sequence.thenSucceed();
})
  .structureName("RedstoneTests:repeater_clock")
  .maxTicks(80)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_nor", async (test) => {
  const testEx = new GameTestExtensions(test);
  const inputA = new BlockLocation(4, 2, 0);
  const inputB = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 3, 0);
  const FlatNorthSouth = 0;
  const FlatEastWest = 1;

  test.pullLever(inputA);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
      
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
  });
        
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  test.pullLever(inputB);    
  await test.idle(1)
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  })
  
  test.succeed();
}).tag(GameTest.Tags.suiteDisabled); // test has 50% pass rate due to "timing" issues.

GameTest.register("RedstoneTests", "rs_latch", (test) => {
  const testEx = new GameTestExtensions(test);
  const r = new BlockLocation(1, 2, 0);
  const s = new BlockLocation(2, 2, 5);

  const q = new BlockLocation(0, 4, 2);
  const notQ = new BlockLocation(3, 4, 3);

  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(r, 2))
    .thenIdle(4)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })
    .thenExecute(() => test.pulseRedstone(r, 2))
    .thenExecuteAfter(4, () => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 2))
    .thenIdle(4)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 2))
    .thenExecuteAfter(4, () => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Redstone timing inconsistencies between java and bedrock.

GameTest.register("RedstoneTests", "rs_latch_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const r = new BlockLocation(1, 2, 0);
  const s = new BlockLocation(2, 2, 5);

  const q = new BlockLocation(0, 4, 2);
  const notQ = new BlockLocation(3, 4, 3);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.pulseRedstone(r, 4))
    .thenIdle(6)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })
    .thenExecute(() => test.pulseRedstone(r, 4))
    .thenExecuteAfter(6, () => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 4))
    .thenIdle(6)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 4))
    .thenExecuteAfter(6, () => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_delay", (test) => {
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 2, 5));

  const lamp1 = new BlockLocation(1, 2, 0);
  const lamp2 = new BlockLocation(3, 2, 0);

  test
    .startSequence()
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 15);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 15);
    })
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 0);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 0);
    })
    .thenSucceed();
})
  .maxTicks(TicksPerSecond * 10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The ticks of Redstone repeater is too short in structure, causing the Redstone lamp will not go out.

GameTest.register("RedstoneTests", "repeater_delay_bedrock", (test) => {
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 2, 5));

  const lamp1 = new BlockLocation(1, 2, 0);
  const lamp2 = new BlockLocation(3, 2, 0);

  test
    .startSequence()
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 15);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 15);
    })
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 0);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 0);
    })
    .thenSucceed();
})
  .maxTicks(TicksPerSecond * 10)
  .tag(GameTest.Tags.suiteDefault); //Change the ticks of Redstone repeater to the longest in structure.

function distManhattan(pos, loc) {
  const xd = Math.abs(pos.x - loc.x);
  const yd = Math.abs(pos.y - loc.y);
  const zd = Math.abs(pos.z - loc.z);

  return xd + yd + zd;
}

GameTest.register("RedstoneTests", "dust_loop_depowering", (test) => {
  const source = new BlockLocation(2, 2, 0);
  const input = new BlockLocation(2, 2, 1);
  const pointA = new BlockLocation(4, 2, 1);
  const pointB = new BlockLocation(0, 2, 16);
  const pointC = new BlockLocation(4, 2, 1);
  const pointD = new BlockLocation(0, 2, 16);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  pointA.blocksBetween(pointB).forEach((p) => {
    test.assertRedstonePower(p, Math.max(0, 15 - distManhattan(p, input)));
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedWhen(() => {
    pointC.blocksBetween(pointD).forEach((p) => {
      test.assertRedstonePower(p, 0);
    });
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java the redstone signal is sent as soon as the redstone block is placed but in Bedrock it need to take a tick or two

GameTest.register("RedstoneTests", "dust_loop_depowering_bedrock", (test) => {
  const source = new BlockLocation(2, 2, 0);
  const input = new BlockLocation(2, 2, 1);
  const pointA = new BlockLocation(4, 2, 1);
  const pointB = new BlockLocation(0, 2, 16);
  const pointC = new BlockLocation(4, 2, 1);
  const pointD = new BlockLocation(0, 2, 16);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  test.runAfterDelay(2, () => {
    pointA.blocksBetween(pointB).forEach((p) => {
      test.assertRedstonePower(p, Math.max(0, 15 - distManhattan(p, input)));
    });
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedWhen(() => {
    pointC.blocksBetween(pointD).forEach((p) => {
      test.assertRedstonePower(p, 0);
    });
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "lever_power", (test) => {
  const powered = [
    new BlockLocation(1, 2, 0),
    new BlockLocation(1, 2, 3),

    new BlockLocation(2, 2, 1),
    new BlockLocation(2, 2, 2),

    new BlockLocation(0, 2, 1),
    new BlockLocation(0, 2, 2),

    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 2),

    new BlockLocation(1, 1, 1),
    new BlockLocation(1, 1, 2),

    new BlockLocation(1, 2, 2),
  ];

  const leverPos = new BlockLocation(1, 2, 1);
  test.pullLever(leverPos);

  const pointA = new BlockLocation(0, 1, 0);
  const pointB = new BlockLocation(2, 3, 3);

  test.succeedIf(() => {
    pointA
      .blocksBetween(pointB)
      .filter((p) => !p.equals(leverPos))
      .forEach((p) => test.assertRedstonePower(p, powered.includes(p) ? 15 : 0));
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "dust_propagation", (test) => {
  let levels = new Map();
  const origin = new BlockLocation(2, 2, 1);

  {
    origin
      .blocksBetween(new BlockLocation(2, 2, 17))
      .forEach((p) => levels.set(p, Math.max(15 - distManhattan(origin, p), 0)));
  }

  {
    levels.set(new BlockLocation(3, 2, 2), 13);
    levels.set(new BlockLocation(3, 2, 9), 6);
    const leftRoot = new BlockLocation(4, 2, 2);
    leftRoot
      .blocksBetween(new BlockLocation(4, 2, 14))
      .forEach((p) => levels.set(p, Math.max(12 - distManhattan(leftRoot, p), 0)));
  }

  {
    levels.set(new BlockLocation(1, 2, 3), 12);
    const rightRoot = new BlockLocation(0, 2, 3);
    rightRoot
      .blocksBetween(new BlockLocation(0, 2, 14))
      .forEach((p) => levels.set(p, Math.max(11 - distManhattan(rightRoot, p), 0)));
  }

  const source = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  for (let [pos, level] of levels) {
    test.assertRedstonePower(pos, level);
  }

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedIf(() => {
    for (let pos of levels.keys()) {
      test.assertRedstonePower(pos, 0);
    }
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java the redstone signal is sent as soon as the redstone block is placed but in Bedrock it need to take a tick or two

GameTest.register("RedstoneTests", "dust_propagation_bedrock", (test) => {
  let levels = new Map();
  const origin = new BlockLocation(2, 2, 1);

  {
    origin
      .blocksBetween(new BlockLocation(2, 2, 17))
      .forEach((p) => levels.set(p, Math.max(15 - distManhattan(origin, p), 0)));
  }

  {
    levels.set(new BlockLocation(3, 2, 2), 13);
    levels.set(new BlockLocation(3, 2, 9), 6);
    const leftRoot = new BlockLocation(4, 2, 2);
    leftRoot
      .blocksBetween(new BlockLocation(4, 2, 14))
      .forEach((p) => levels.set(p, Math.max(12 - distManhattan(leftRoot, p), 0)));
  }

  {
    levels.set(new BlockLocation(1, 2, 3), 12);
    const rightRoot = new BlockLocation(0, 2, 3);
    rightRoot
      .blocksBetween(new BlockLocation(0, 2, 14))
      .forEach((p) => levels.set(p, Math.max(11 - distManhattan(rightRoot, p), 0)));
  }

  const source = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  test.runAfterDelay(2, () => {
    for (let [pos, level] of levels) {
      test.assertRedstonePower(pos, level);
    }
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedIf(() => {
    for (let pos of levels.keys()) {
      test.assertRedstonePower(pos, 0);
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_nand", (test) => {
  const testEx = new GameTestExtensions(test);
  const inputA = new BlockLocation(4, 2, 0);
  const inputB = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 4);

  test
    .startSequence()
    .thenExecute(() => test.pullLever(inputA))
    .thenIdle(2)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 1, output))
    .thenExecuteAfter(2, () => test.pullLever(inputA))

    .thenExecuteAfter(2, () => test.pullLever(inputB))
    .thenIdle(2)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 1, output))
    .thenExecuteAfter(2, () => test.pullLever(inputB))

    .thenExecuteAfter(2, () => {
      test.pullLever(inputA);
      test.pullLever(inputB);
    })
    .thenIdle(4)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 0, output))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "comparator_logic", (test) => {
  const mainInput = new BlockLocation(3, 2, 2);
  const sideInput = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(0, 2, 2);

  const mainMusicPlayerComp = test.getBlock(mainInput).getComponent("recordPlayer");
  const sideMusicPlayerComp = test.getBlock(sideInput).getComponent("recordPlayer");

  let sequence = test.startSequence();
  for (const [mainLevel, mainRecord] of LEVEL_TO_RECORDS) {
    for (const [sideLevel, sideRecord] of LEVEL_TO_RECORDS) {
      let value = mainLevel >= sideLevel ? mainLevel : 0;
      sequence = sequence
        .thenExecute(() => {
          if (mainLevel == 0) {
            mainMusicPlayerComp.clearRecord();
          } else {
            mainMusicPlayerComp.setRecord(mainRecord);
          }
          if (sideLevel == 0) {
            sideMusicPlayerComp.clearRecord();
          } else {
            sideMusicPlayerComp.setRecord(sideRecord);
          }
        })
        .thenWaitAfter(4, () => {
          test.assertRedstonePower(output, value);
        });
    }
  }
  sequence.thenSucceed();
})
  .maxTicks(TicksPerSecond * 60)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "subtractor_logic", (test) => {
  const mainInput = new BlockLocation(3, 2, 2);
  const sideInput = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(0, 2, 2);

  const mainMusicPlayerComp = test.getBlock(mainInput).getComponent("recordPlayer");
  const sideMusicPlayerComp = test.getBlock(sideInput).getComponent("recordPlayer");

  let sequence = test.startSequence();
  for (const [mainLevel, mainRecord] of LEVEL_TO_RECORDS) {
    for (const [sideLevel, sideRecord] of LEVEL_TO_RECORDS) {
      let value = Math.max(mainLevel - sideLevel, 0);
      sequence = sequence
        .thenExecute(() => {
          if (mainLevel == 0) {
            mainMusicPlayerComp.clearRecord();
          } else {
            mainMusicPlayerComp.setRecord(mainRecord);
          }
          if (sideLevel == 0) {
            sideMusicPlayerComp.clearRecord();
          } else {
            sideMusicPlayerComp.setRecord(sideRecord);
          }
        })
        .thenWaitAfter(3, () => {
          test.assertRedstonePower(output, value);
        });
    }
  }
  sequence.thenSucceed();
})
  .maxTicks(TicksPerSecond * 60)
  .tag(GameTest.Tags.suiteDefault);
