import * as GameTest from "mojang-gametest";
import { BlockLocation, Direction, ItemStack, Location, MinecraftBlockTypes, MinecraftItemTypes, TicksPerSecond } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const SENSOR_ACTIVE_TICKS = 40;
const SENSOR_COOLDOWN_TICKS = 1;
const SENSOR_MAX_DELAY_TICKS = 8;
const REDSTONE_DELAY_TICKS = 2;

function succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency) {
    test.succeedWhen(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    });
}

function failOnVibrationDetected(test, sensorPos, duration, delay = 0) {
    test.startSequence().thenIdle(delay).thenExecuteFor(duration, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
}

// Tests that a Sculk Sensor does not detect Dirt being destroyed in a 9 blocks radius around it.
GameTest.register("VibrationTests", "detection_radius", (test) => {
    const sensorPos = new BlockLocation(9, 11, 9);

    const minDestroyPos = new BlockLocation(0, 2, 0);
    const maxDestroyPos = new BlockLocation(18, 20, 18);

    minDestroyPos.blocksBetween(maxDestroyPos).forEach((pos) => {
        if (test.getBlock(pos).id == "minecraft:dirt") {
            test.destroyBlock(pos);
        }
    });

    failOnVibrationDetected(test, sensorPos, SENSOR_MAX_DELAY_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

function destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, destroyPos, expectedLitPos) {
    sequence.thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + REDSTONE_DELAY_TICKS, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, expectedLitPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

function spawnCreeperAndTestComparatorOutput(test, sequence, sensorPos, spawnPos, expectedLitPos) {
    sequence.thenExecute(() => {
        test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + REDSTONE_DELAY_TICKS, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, expectedLitPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

// Tests that the output strenght of a Sculk Sensor (verified by checking Redstone Lamps being powered) is correct for a vibration
// emitted at a certain distance (produced by destroying a block).
GameTest.register("VibrationTests", "output_distance", (test) => {
    const sensorPos = new BlockLocation(16, 2, 9);

    let sequence = test.startSequence();

    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -8), sensorPos.offset(-1, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -7), sensorPos.offset(-2, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(3, 0, -6), sensorPos.offset(-3, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -6), sensorPos.offset(-4, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(3, 0, -5), sensorPos.offset(-5, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -5), sensorPos.offset(-6, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(2, 0, -4), sensorPos.offset(-7, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -4), sensorPos.offset(-8, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(2, 0, -3), sensorPos.offset(-9, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -3), sensorPos.offset(-10, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(1, 0, -2), sensorPos.offset(-11, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -2), sensorPos.offset(-12, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(1, 0, -1), sensorPos.offset(-13, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -1), sensorPos.offset(-14, -1, 1));
    spawnCreeperAndTestComparatorOutput(test, sequence, sensorPos, new Location(16.5, 3, 9.5), sensorPos.offset(-15, -1, 1));

    sequence.thenSucceed();
})
    .maxTicks(TicksPerSecond * 60)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor reacts to the closest vibration emitted in a tick.
GameTest.register("VibrationTests", "activation_multiple_vibrations", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPosFar = new BlockLocation(9, 2, 1);
    const destroyPosClose = new BlockLocation(9, 2, 10);

    test.startSequence().thenExecute(() => {
        // Executed at tick 0.
        test.destroyBlock(destroyPosFar);
        test.destroyBlock(destroyPosClose);
    }).thenExecuteAfter(1, () => {
        // Executed at tick 1. Sensor have been activated by second vibration.
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

function destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, destroyPos, delay) {
    sequence.thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenExecuteAfter(delay, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

// Tests that a Sculk Sensor activates with a delay in ticks equal to the distance a vibration has been emitted at.
GameTest.register("VibrationTests", "activation_delay", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    let sequence = test.startSequence();

    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -8), 8);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -7), 7);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -6), 6);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -5), 5);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -4), 4);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -3), 3);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -2), 2);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -1), 1);

    sequence.thenSucceed();
})
    .maxTicks(TicksPerSecond * 60)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor activates and stays active for the expected amount of time when receiving a vibration.
GameTest.register("VibrationTests", "activation_duration", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPos = new BlockLocation(8, 2, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenWaitAfter(1, () => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenWaitAfter(SENSOR_ACTIVE_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor ignores vibrations while on cooldown.
GameTest.register("VibrationTests", "activation_cooldown", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPos1 = new BlockLocation(8, 2, 9);
    const destroyPos2 = new BlockLocation(10, 2, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(destroyPos1);
    }).thenWaitAfter(1, () => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenWaitAfter(SENSOR_ACTIVE_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        test.destroyBlock(destroyPos2);
    }).thenWaitAfter(SENSOR_COOLDOWN_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor can react to vibrations (emitted by destroying a block) only if they are not occluded by Wool.
GameTest.register("VibrationTests", "activation_wool_occlusion", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const occuledDestroyPos1 = new BlockLocation(5, 2, 9);
    const occuledDestroyPos2 = new BlockLocation(9, 2, 13);
    const occuledDestroyPos3 = new BlockLocation(13, 2, 9);
    const unocculedDestroyPos1 = new BlockLocation(9, 2, 5);
    const unocculedDestroyPos2 = new BlockLocation(9, 6, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(occuledDestroyPos1);
        test.destroyBlock(occuledDestroyPos2);
        test.destroyBlock(occuledDestroyPos3);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        test.destroyBlock(unocculedDestroyPos1);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenExecuteAfter(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        test.destroyBlock(unocculedDestroyPos2);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor cannot react to vibrations (emitted by destroying a block) occluded by Wool, no matter the relative position of the occluded source.
GameTest.register("VibrationTests", "activation_wool_occlusion_no_bias", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const occuledDestroyPos1 = new BlockLocation(6, 2, 6);
    const occuledDestroyPos2 = new BlockLocation(6, 2, 12);
    const occuledDestroyPos3 = new BlockLocation(12, 2, 6);
    const occuledDestroyPos4 = new BlockLocation(12, 2, 12);

    test.destroyBlock(occuledDestroyPos1);
    test.destroyBlock(occuledDestroyPos2);
    test.destroyBlock(occuledDestroyPos3);
    test.destroyBlock(occuledDestroyPos4);

    failOnVibrationDetected(test, sensorPos, SENSOR_MAX_DELAY_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(16.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity moving through Cobwebs produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move_cobweb", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(11.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(7, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity moving through Pownder Snow produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move_powder_snow", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(11.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(7, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity does not produce vibrations while on Wool.
GameTest.register("VibrationTests", "event_entity_move_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity does not produce vibrations while on Wool Carpet.
GameTest.register("VibrationTests", "event_entity_move_carpet", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2.5, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a vibration dampening entity (Warden) does not produce vibrations when moving.
GameTest.register("VibrationTests", "event_entity_move_dampening", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2, 7.5);
    const warden = test.spawnWithoutBehaviorsAtLocation("minecraft:warden", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(warden, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity standing still in Scaffolding does not produce vibrations.
GameTest.register("VibrationTests", "event_entity_move_scaffolding", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 3, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving player does not produce vibrations when sneaking, but does otherwise.
GameTest.register("VibrationTests", "event_entity_move_sneaking", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new BlockLocation(11, 2, 7);
    const targetPos = new BlockLocation(7, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "Gordon");

    test.startSequence().thenExecute(() => {
        player.isSneaking = true;
        player.moveToBlock(targetPos);
    }).thenExecuteFor(TicksPerSecond * 5, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        player.isSneaking = false;
        player.moveToBlock(spawnPos);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 30)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor can receive vibrations from a sneaking entity only if the entity is moving on top of it.
GameTest.register("VibrationTests", "event_entity_move_sneaking_on_sensor", (test) => {
    const sneakOnSensorPos = new BlockLocation(9, 2, 9);
    const unaffectedSensorPos = new BlockLocation(9, 5, 9);

    const spawnPos = new Location(7.5, 2, 9.5);
    const targetPos = new BlockLocation(11, 2, 9);
    // Using a Pig as for some reason Simulated Players do not trigger onStandOn.
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    test.startSequence().thenExecute(() => {
        pig.isSneaking = true;
        test.walkTo(pig, targetPos, 1);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sneakOnSensorPos);
    }).thenExecuteFor(TicksPerSecond * 5, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, unaffectedSensorPos);
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 30)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a flying parrot produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_parrot", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(11.5, 2, 9.5);
    const parrot = test.spawnWithoutBehaviorsAtLocation("minecraft:parrot", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(parrot, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a flying bee produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_bee", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(11.5, 2, 9.5);
    const bee = test.spawnWithoutBehaviorsAtLocation("minecraft:bee", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(bee, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a falling chicken produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_chicken", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:chicken", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a swimming entity produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_swim", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 3;

    const spawnPos = new Location(11.5, 2, 9.5);
    const fish = test.spawnWithoutBehaviorsAtLocation("minecraft:tropicalfish", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(fish, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a swimming entity staying still in water does not produce vibrations.
GameTest.register("VibrationTests", "event_swim_still", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 2, 7.5);
    test.spawnAtLocation("minecraft:tropicalfish", spawnPos);

    // When the fish is spawned, it emits a splash vibration, so we wait for the sensor to reset before checking for further ones.
    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 1, SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat moving on water produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_swim_boat", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 3;

    const spawnPos = new Location(11.5, 3, 6.5);
    const boat = test.spawnAtLocation("minecraft:boat", spawnPos);

    const targetPos = new BlockLocation(6, 3, 7);
    test.walkTo(boat, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat staying still on water does not produce vibrations.
GameTest.register("VibrationTests", "event_swim_boat_still", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 3, 6.5);
    test.spawnAtLocation("minecraft:boat", spawnPos);

    // When the Boat is spawned, it emits a splash vibration, so we wait for the sensor to reset before checking for further ones.
    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 4, SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
})
    .tag(GameTest.Tags.suiteDefault)
    .maxTicks(TicksPerSecond * 5 + SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);

// Tests that an entity hitting ground produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_hit_ground", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 5;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// [Bug 734008] Tests that a vibration dampening item (a Wool block, ejected by powering a Dispenser containing it) does not produce vibrations when hitting ground.
GameTest.register("VibrationTests", "event_hit_ground_dampening", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const placeAtPos = new BlockLocation(9, 6, 6);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity falling on Wool does not produce vibrations.
GameTest.register("VibrationTests", "event_hit_ground_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor detects Wool in item form (retrieved from the .mcstructure) lying on top of it.
GameTest.register("VibrationTests", "event_sculk_touch_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity falling in Water produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_splash", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat (retrieved from the .mcstructure) on top of a Bubble Column produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_splash_boat_on_bubble_column", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .maxTicks(TicksPerSecond * 15)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a projectile being shot (by powering a Dispenser) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_projectile_shoot", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 8);
    const expectedFrequency = 7;

    const placeAtPos = new BlockLocation(9, 4, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a landing projectile (shot by powering a Dispenser) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_projectile_land", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 8;

    const placeAtPos = new BlockLocation(9, 4, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a projectile (shot by powering a Dispenser) does not produce vibrations when landing on wool.
GameTest.register("VibrationTests", "event_projectile_land_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const placeAtPos = new BlockLocation(9, 7, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity being damaged (by standing on Magma) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_damage", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 8;

    const spawnPos = new Location(9.5, 2, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an emtpy Dispenser trying to dispense produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_dispense_fail", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 10;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Fence Gate being closed (by removing the Redstone Block powering it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_close", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 10;

    const placeAtPos = new BlockLocation(12, 2, 5);
    test.setBlockType(MinecraftBlockTypes.air, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Fence Gate being opened (by placing a Redstone Block to power it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_open", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 11;

    const placeAtPos = new BlockLocation(12, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that picking-up Water (by powering a Dispenser with an Empty Bucket in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_fluid_pickup", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 13;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that placing Water (by powering a Dispenser with a Water Bucket in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_fluid_place", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 12;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player destroying a block produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_destroy", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 13;

    const spawnPos = new BlockLocation(9, 2, 6);
    const player = test.spawnSimulatedPlayer(spawnPos, "Ralph");

    const breakPos = new BlockLocation(9, 2, 7);
    player.lookAtBlock(breakPos);
    player.breakBlock(breakPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player closing a Chest produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_container_close", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 14;

    const spawnPos = new BlockLocation(9, 2, 5);
    const chestPos = new BlockLocation(9, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "Corvo");

    test.startSequence().thenExecuteAfter(20, () => {
        player.interactWithBlock(chestPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        player.stopInteracting();
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player opening a Chest produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_container_open", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const spawnPos = new BlockLocation(9, 2, 5);
    const chestPos = new BlockLocation(9, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "John");

    test.startSequence().thenExecuteAfter(20, () => {
        player.interactWithBlock(chestPos);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that spawning a Pillager (by powering a Dispenser with a Spawn Egg in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_place", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 12;

    const placeAtPos = new BlockLocation(9, 2, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that equipping an Armor Stand (by powering a Dispenser with equipment in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_equip", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 9;

    const placeAtToDispenseSwordPos = new BlockLocation(7, 2, 6);
    const placeAtToDispenseHelmetPos = new BlockLocation(11, 2, 6);

    const testEx = new GameTestExtensions(test);

    test.startSequence().thenExecute(() => {
        test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtToDispenseSwordPos);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtToDispenseHelmetPos);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that exploding TNT (ignited by placing a Redstone Block) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_explode", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const placeAtPos = new BlockLocation(9, 3, 6);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a piston being contracted (by removing the Redstone Block powering it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_piston_contract", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 14;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.air, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a piston being extened (by placing a Redstone Block to power it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_piston_extend", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Cake with Candle being ignited (by powering a Dispenser with a Flint and Steel in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_change", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a lightning produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_lightning_strike", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const spawnPos = new Location(9.5, 2, 5.5);
    test.spawnAtLocation("minecraft:lightning_bolt", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);
