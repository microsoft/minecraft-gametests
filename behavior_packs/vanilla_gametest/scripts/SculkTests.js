import * as GameTest from "mojang-gametest";
import { BlockLocation, BlockProperties, MinecraftBlockTypes, TicksPerSecond } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TEST_PADDING = 5;

function spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, sculkBlockType, sculkBlockPos, charge) {
    test.assertBlockPresent(sculkBlockType, sculkBlockPos);
    const cursorOffset = new BlockLocation(
        sculkBlockPos.x - spreaderPos.x,
        sculkBlockPos.y - spreaderPos.y,
        sculkBlockPos.z - spreaderPos.z);
    sculkSpreader.addCursorsWithOffset(cursorOffset, charge);
}

function placeSculkAndSpread(test, sculkSpreader, spreaderPos, pos, charge) {
    test.setBlockType(MinecraftBlockTypes.sculk, pos);
    spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, MinecraftBlockTypes.sculk, pos, charge);
}

function placeSculkVeinAndSpread(test, sculkSpreader, spreaderPos, pos, faceMask, charge) {
    let downFacingSculkVeinBlock = MinecraftBlockTypes.sculkVein.createDefaultBlockPermutation();
    downFacingSculkVeinBlock.getProperty(BlockProperties.multiFaceDirectionBits).value = faceMask;
    test.setBlockPermutation(downFacingSculkVeinBlock, pos);
    spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, MinecraftBlockTypes.sculkVein, pos, charge);
}

GameTest.register("SculkTests", "spread", (test) => {
    const spawnPos = new BlockLocation(2, 5, 2);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 1));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_path", (test) => {
    const spawnPos = new BlockLocation(0, 5, 1);
    test.spawn("minecraft:guardian", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculkVein, new BlockLocation(4, 5, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(4, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.stone, new BlockLocation(4, 4, 1));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_path_restricted", (test) => {
    const spawnPos = new BlockLocation(1, 5, 1);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 4, 3));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_uneven", (test) => {
    const MIN_CONSUMED_BLOCKS_COUNT = 25;
    const MAX_RESIDUAL_CHARGE = 5;
    const INITIAL_CHARGE_SMALL = 5;
    const INITIAL_CHARGE_BIG = 30;

    const sculkCatalystPos = new BlockLocation(2, 3, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !== undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE_SMALL);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE_BIG);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id ===  "minecraft:sculk") {
                        ++sculkCount;
                    }
                }
            }
        };

        test.assert(sculkCount >= MIN_CONSUMED_BLOCKS_COUNT, "Spreading was not successful! Just " + sculkCount + " sculk blocks were placed!");
        test.assert(sculkSpreader.getTotalCharge() <= MAX_RESIDUAL_CHARGE, "Residual charge of " + sculkSpreader.getTotalCharge() + " is too high!");
    });
})
    .maxTicks(TicksPerSecond * 10)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_uneven_overcharged", (test) => {
    const MIN_CONSUMED_BLOCKS_COUNT = 25;
    const MIN_RESIDUAL_CHARGE = 25;
    const INITIAL_CHARGE = 30;

    const sculkCatalystPos = new BlockLocation(2, 3, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id ===  "minecraft:sculk") {
                        ++sculkCount;
                    }
                }
            }
        };

        test.assert(sculkCount >= MIN_CONSUMED_BLOCKS_COUNT, "Spreading was not successful! Just " + sculkCount + " sculk blocks were placed!");
        test.assert(sculkSpreader.getTotalCharge() >= MIN_RESIDUAL_CHARGE, "Residual charge of " + sculkSpreader.getTotalCharge() + " is too low!");
    });
})
    .maxTicks(TicksPerSecond * 10)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_up", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 3, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 17, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_up_unsupported", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 3, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 17, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_down", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 17, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 17, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 3, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_pillar_up", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 12;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT - 1;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(2, 4, 1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 14, 2));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(2, 15, 2));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_consume_blocks", (test) => {
    const TEST_AREA_SIZE_X = 10;
    const TEST_AREA_SIZE_Z = 5;
    const CONSUME_ROW_DELAY = TEST_AREA_SIZE_X * 2;
    const CONSUME_ROW_CHARGE = TEST_AREA_SIZE_X;

    const sculkCatalystPos = new BlockLocation(4, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 0), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 2, 1), /* faceMask (up) = */ 1 << 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 2), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 2, 3), /* faceMask (up) = */ 1 << 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 4), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);

    test.startSequence().thenExecuteAfter(CONSUME_ROW_DELAY, () => {
        for (var x = 0; x < TEST_AREA_SIZE_X; x++) {
            for (var z = 0; z < TEST_AREA_SIZE_Z; z++) {
                const testPos = new BlockLocation(x, 3, z);
                var blockID = test.getBlock(testPos).type.id.valueOf();
                test.assert(blockID ===  "minecraft:sculk", blockID + " is expected to be consumed by sculk.");
            }
        }
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_spread_blocks", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 4)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 4)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 4)).kill();

    test.succeedWhen(() => {
        for (var x = 0; x < 5; ++x) {
            for (var z = 0; z < 5; ++z) {
                const isSculk = test.getBlock(new BlockLocation(x, 3, z)).id ===  "minecraft:sculk" || test.getBlock(new BlockLocation(x, 4, z)).id ===  "minecraft:sculk_vein";
                test.assert(isSculk, "Sculk failed to spread to [" + x + ", " + z + "]!");
            }
        };
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_spread_blocks_replaceable", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(6, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(6, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(9, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(9, 3, 3)).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(7, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(7, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(9, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(9, 2, 3));
    });
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_spread_blocks", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 4, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 4, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 4, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 4, 3)).kill();

    // We need a delay to check if veins spread more then expected, otherwise the
    // test will succeed the moment the expected amount of veins has been placed.
    test.succeedOnTickWhen(TicksPerSecond * 2, () => {
        var sculkVeinCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var z = 0; z < 5; ++z) {
                if (test.getBlock(new BlockLocation(x, 4, z)).id ===  "minecraft:sculk_vein") {
                    ++sculkVeinCount;
                }
            }
        };
        test.assert(sculkVeinCount ===  4, "Only 4 veins where expected to be placed, one for each mob death position!");
    });
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_spread_fire", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 3, 3)).kill();

    test.startSequence().thenExecuteFor(TicksPerSecond * 2, () => {
        test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(1, 3, 3));
        test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(4, 3, 3));
        test.assertBlockPresent(MinecraftBlockTypes.soulFire, new BlockLocation(1, 3, 1));
        test.assertBlockPresent(MinecraftBlockTypes.soulFire, new BlockLocation(4, 3, 1));
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that no sculk vein is placed on a catalyst if a mob dies on top of it.
GameTest.register("SculkTests", "vein_non_spread_catalyst", (test) => {
    const spawnPos = new BlockLocation(2, 3, 2);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.startSequence().thenExecuteFor(TicksPerSecond * 2, () => {
        test.assertBlockPresent(MinecraftBlockTypes.air, spawnPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_under_water", (test) => {
    const INITIAL_CHARGE = 30;

    const sculkCatalystPos = new BlockLocation(2, 7, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(3, 6, 3);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2));
    })
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_place_blocks", (test) => {
    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    test.spawn("minecraft:creeper", new BlockLocation(1, 30, 2));
    test.spawn("minecraft:creeper", new BlockLocation(2, 30, 1));
    test.spawn("minecraft:creeper", new BlockLocation(2, 30, 3));
    test.spawn("minecraft:creeper", new BlockLocation(3, 30, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 4, () => {
        var testPos = new BlockLocation(0, 0, 0);
        for (var y = 2; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                for (var z = 0; z < 5; z++) {
                    testPos = new BlockLocation(x, y, z);
                    var blockID = test.getBlock(testPos).type.id.valueOf();
                    test.assert(blockID !==  "minecraft:sculk", "Sculk should not have spread.");
                    test.assert(blockID !==  "minecraft:sculk_vein", "Sculk Vein should not have spread.");
                }
            }
        }
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_cap", (test) => {
    const MERGEABLE_EXPERIENCE_AMOUNT = 25;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const mobSpawnLocation = new BlockLocation(2, 4, 2);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 3, 2), sculkSpreader.maxCharge - MERGEABLE_EXPERIENCE_AMOUNT);

    test.startSequence().thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  2, "Charges should not merge above maximum.");
    }).thenSucceed();

})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on an experienceless mob death, a catalyst blooms but does not get a cursor.
GameTest.register("SculkTests", "catalyst_no_xp_death", (test) => {
    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const mobSpawnLocation = sculkCatalystPos.offset(0, 1, 0);
    test.spawn("minecraft:villager_v2<minecraft:spawn_farmer>", mobSpawnLocation).kill();

    test.startSequence().thenExecuteAfter(2, () => {
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  0, "Expected total number of cursors to be 0. Actual amount: " + numberOfCursors);
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("bloom", 1, sculkCatalystPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on mob death, only the closest catalyst gets a cursor.
GameTest.register("SculkTests", "multiple_catalysts_one_death", (test) => {
    const catalystPositions = [
        new BlockLocation(0, 2, 0),
        new BlockLocation(4, 2, 0),
        new BlockLocation(4, 2, 4),
        new BlockLocation(0, 2, 4)];

    catalystPositions.forEach(location => test.assert(test.getSculkSpreader(location) !==  undefined, "Failed to find sculk catalyst."));

    const closestCatalystPosition = catalystPositions[0];
    const mobSpawnLocation = closestCatalystPosition.offset(0, 2, 0);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors ===  1, "Expected total number of cursors to be 1. Actual amount: " + numberOfCursors);
        const closestCatalystCursors = test.getSculkSpreader(closestCatalystPosition).getNumberOfCursors();
        test.assert(closestCatalystCursors ===  1, "Expected the closest sculk catalyst to get the cursor.");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on mob death, only the closest catalyst gets a cursor. In this case, a mob dies on top
// of each one of the four catalysts, resulting in four cursors being created, one per catalyst.
GameTest.register("SculkTests", "multiple_catalysts_multiple_deaths", (test) => {
    const catalystPositions = [
        new BlockLocation(0, 2, 0),
        new BlockLocation(4, 2, 0),
        new BlockLocation(4, 2, 4),
        new BlockLocation(0, 2, 4)];

    catalystPositions.forEach(location => {
        test.assert(test.getSculkSpreader(location) !==  undefined, "Failed to find sculk catalyst.");
        test.spawn("minecraft:creeper", location.offset(0, 2, 0)).kill();
    });

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors ===  4, "Expected total number of cursors to be 4. Actual amount: " + numberOfCursors);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_decay_sculk", (test) => {
    const INITIAL_CHARGE = 20;
    const FINAL_CHARGE = 19;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge ===  FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
    });
})
    .maxAttempts(5)
    .maxTicks(TicksPerSecond * 20)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_decay_sculk_vein", (test) => {
    const INITIAL_CHARGE = 20;
    const FINAL_CHARGE = 0;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(2, 6, 2);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge ===  FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
    });
})
    .maxAttempts(5)
    .maxTicks(TicksPerSecond * 20)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "sculk_growth_spawning", (test) => {
    const INITIAL_CHARGE = 100;

    const sculkCatalystPos = new BlockLocation(4, 4, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    for (var z = 1; z < 4; z++) {
        const spreadStartPos = new BlockLocation(1, 4, z);
        placeSculkAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, INITIAL_CHARGE);
    }

    test.succeedOnTickWhen(TicksPerSecond * 20, () => {
        var position = new BlockLocation(0, 0, 0);

        var farGrowths = 0;
        for (var x = 8; x < 14; x++) {
            for (var z = 1; z < 4; z++) {
                position = new BlockLocation(x, 5, z);
                var blockID = test.getBlock(position).type.id.valueOf();
                var worldBlockLocation = test.worldBlockLocation(position);
                if (blockID === "minecraft:sculk_sensor" || blockID === "minecraft:sculk_shrieker") {
                    farGrowths++;
                }
            }
        }

        test.assert(farGrowths > 1, "At least 2 growths should have spawned from the catalyst. Number spawned: " + farGrowths);

        var nearGrowths = 0;
        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                position = new BlockLocation(x, 5, z);
                var blockID = test.getBlock(position).type.id.valueOf();
                if (blockID === "minecraft:sculk_sensor" || blockID === "minecraft:sculk_shrieker") {
                    nearGrowths++;
                }
            }
        }

        test.assert(nearGrowths ===  0, "No growths should have spawned near the catalyst.");
    });
})
    .maxTicks(TicksPerSecond * 40)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_forced_direction", (test) => {
    const INITIAL_CHARGE = 25;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(1, 3, 2), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(1, 13, 2), INITIAL_CHARGE);

    test.startSequence().thenExecuteAfter(TicksPerSecond * 1, () => {
        const expected = [
            new BlockLocation(1, 7, 2),
            new BlockLocation(1, 9, 2)];
        const actual = [
            test.relativeBlockLocation(sculkSpreader.getCursorPosition(0)),
            test.relativeBlockLocation(sculkSpreader.getCursorPosition(1))];

        test.assert(expected[0].equals(actual[0]),
            "Expected charge ends up on on (" + expected[0].x + ", " + expected[0].y + ", " + expected[0].z + "), not (" + actual[0].x + ", " + actual[0].y + ", " + actual[0].z + ").");
        test.assert(expected[1].equals(actual[1]),
            "Expected charge ends up on on (" + expected[1].x + ", " + expected[1].y + ", " + expected[1].z + "), not (" + actual[1].x + ", " + actual[1].y + ", " + actual[1].z + ").");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_redirection", (test) => {
    const INITIAL_CHARGE = 100;

    const sculkCatalystPos = new BlockLocation(5, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(4, 5, 2), INITIAL_CHARGE);

    test.startSequence().thenExecuteAfter(TicksPerSecond * 2, () => {
        const expectedPos = new BlockLocation(6, 5, 2);
        const cursorPosition = sculkSpreader.getCursorPosition(0);
        const existingPos = test.relativeBlockLocation(cursorPosition);
        test.assert(expectedPos.equals(existingPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + existingPos.x + ", " + existingPos.y + ", " + existingPos.z + ").");

        test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(5, 6, 3));
    }).thenExecuteAfter(TicksPerSecond * 2, () => {
        const expectedPos = new BlockLocation(4, 5, 2);
        const cursorPosition = sculkSpreader.getCursorPosition(0);
        const existingPos = test.relativeBlockLocation(cursorPosition);
        test.assert(expectedPos.equals(existingPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + existingPos.x + ", " + existingPos.y + ", " + existingPos.z + ").");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_merging", (test) => {
    const INITIAL_CHARGE = 5;
    const MIN_RESIDUAL_CHARGE = 12;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 0), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 4), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(4, 5, 2), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(0, 5, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  1, "There are " + numberOfCursors + " cursors, should be only one");
        test.assert(totalCharge >= MIN_RESIDUAL_CHARGE, "Total charge of + " + INITIAL_CHARGE * 4 + " + should be roughly preserved, current charge: " + totalCharge);
    });
})
    .maxTicks(TicksPerSecond * 5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_in_air_disappear", (test) => {
    const INITIAL_CHARGE = 20;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge ===  INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

    test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 4, 2));

    test.startSequence().thenExecuteAfter(3, () => {
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  0, "The cursor did not disappear in 3 ticks despite having no substrate.");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_in_air_jump", (test) => {
    const INITIAL_CHARGE = 20;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge ===  INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

    test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 4, 2));
    test.setBlockType(MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 2));

    test.startSequence().thenExecuteAfter(3, () => {
        const expectedPos = new BlockLocation(2, 5, 2);
        const cursorPos = sculkSpreader.getCursorPosition(0);
        const currentPos = test.relativeBlockLocation(cursorPos);
        test.assert(expectedPos.equals(currentPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + currentPos.x + ", " + currentPos.y + ", " + currentPos.z + ")");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_from_moving_blocks", (test) => {
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(8, 9, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 10, () => {
        test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(8, 9, 2));

        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(x, 0, z), /* isPresent = */ false)
            }
        }
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 15)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_to_moving_blocks", (test) => {
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(8, 9, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 10, () => {
        // Deactivate the contraption to prevent detection of moving blocks.
        test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(8, 9, 2));
    }).thenExecuteAfter(TicksPerSecond * 1, () => {
        var sculkCount = 0;
        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                if (test.getBlock(new BlockLocation(x, 3, z)).id ===  "minecraft:sculk") {
                    ++sculkCount;
                }
            }
        }

        test.assert(sculkCount >= 5, "Sculk is expected to spread on slow enough moving blocks!");
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 15)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_on_player_death", (test) => {
    const DIE_BY_FALL_DAMAGE_HEIGHT = 25;
    const DIE_BY_FALL_DAMAGE_TIME = TicksPerSecond * 2;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const grassPos = new BlockLocation(1, 4, 2);
    const grassWithTallGrassPos = new BlockLocation(3, 4, 2);

    test.startSequence().thenExecute(() => {
        const player1 = test.spawnSimulatedPlayer(grassPos.offset(0, DIE_BY_FALL_DAMAGE_HEIGHT, 0), "Giovanni");
        player1.addExperience(10);
    }).thenExecuteAfter(DIE_BY_FALL_DAMAGE_TIME, () => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, grassPos);
    }).thenExecute(() => {
        const player2 = test.spawnSimulatedPlayer(grassWithTallGrassPos.offset(0, DIE_BY_FALL_DAMAGE_HEIGHT, 0), "Giorgio");
        player2.addExperience(10);
    }).thenExecuteAfter(DIE_BY_FALL_DAMAGE_TIME, () => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, grassWithTallGrassPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);
