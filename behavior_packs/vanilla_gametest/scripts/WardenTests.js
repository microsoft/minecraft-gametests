import * as GameTest from "mojang-gametest";
import { BlockLocation, TicksPerSecond, Location } from "mojang-minecraft";
const WARDEN_TESTS_PADDING = 16; // The paddings is there to make sure vibrations don't interefere with the warden 


GameTest.register("WardenTests", "warden_despawn", (test) => {
    const wardenEntityType = "minecraft:warden";
    const startPos = new BlockLocation(3, 1, 3);
    test.spawn(wardenEntityType, startPos.above());

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea(wardenEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 100).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 100 seconds

GameTest.register("WardenTests", "warden_kill_moving_entity", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPig = new Location(6, 2, 6);
    const walkPosPig = new Location(6, 2, 1);
    test.spawn(wardenEntityType, startPosWarden.above());
    const pig = test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    let sequence = test.startSequence().thenIdle(1);

    for (let i = 1; i <= 10; i++) {
        sequence
            .thenExecute(() => {
                test.walkToLocation(pig, walkPosPig, 1);
            })
            .thenIdle(TicksPerSecond * 3)
            .thenExecute(() => {
                test.walkToLocation(pig, startPosPig, 1);
            })
            .thenIdle(TicksPerSecond * 3)
    }
    sequence
        .thenWait(() => {
            test.assertEntityPresentInArea(pigEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 90).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 90 seconds

GameTest.register("WardenTests", "warden_sniff_and_kill_static_entity", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPig = new Location(7, 2, 7);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea(pigEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds

GameTest.register("WardenTests", "warden_sniff_and_kill_player_before_mob", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPlayer = new BlockLocation(1, 2, 6);
    const startPosPig = new Location(6, 2, 6);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);
    test.spawnSimulatedPlayer(startPosPlayer, "playerSim_warden");

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:player", false);
        })
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:pig", true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds

GameTest.register("WardenTests", "warden_go_to_projectile", (test) => {
    const wardenEntityType = "minecraft:warden";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const snowballEntityType = "minecraft:snowball";
    // spawns snowball above the ground so that it falls down and breaks
    const startPosSnowball = new BlockLocation(7, 4, 7);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawn(snowballEntityType, startPosSnowball);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresent(wardenEntityType, startPosSnowball, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 10).padding(WARDEN_TESTS_PADDING); //timeout after 10 seconds

GameTest.register("WardenTests", "warden_path_lava", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 3, 2);
    const startPosPig = new Location(7, 3, 2);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:pig", false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds

GameTest.register("WardenTests", "warden_path_water", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 3, 2);
    const startPosPig = new Location(7, 3, 2);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:pig", false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds
