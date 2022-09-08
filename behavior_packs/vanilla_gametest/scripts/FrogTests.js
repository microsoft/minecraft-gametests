import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, Location, TicksPerSecond, MinecraftBlockTypes } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("FrogTests", "frog_jump", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(0, 7, 0);
    const endPos = new BlockLocation(3, 7, 0);
    test.spawn(frogEntityType, startPos);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresent(frogEntityType, endPos, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 20).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "frog_eat_slime_drop_slimeball", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const slimeEntityType = "minecraft:slime<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(slimeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.slimeBall, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "temperate_frog_magmacube_drop_ochre", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.ochreFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "warm_frog_magmacube_drop_pearlescent", (test) => {
    const frogEntityType = "minecraft:frog<spawn_warm>";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.pearlescentFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "cold_frog_magmacube_drop_verdant", (test) => {
    const frogEntityType = "minecraft:frog<spawn_cold>";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.verdantFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "frog_lay_egg", (test) => {
    const startPosFrogOne = new BlockLocation(0, 4, 1);
    const startPosFrogTwo = new BlockLocation(4, 4, 1);
    const startPosPlayer = new BlockLocation(2, 4, 0);
    const spawnPos = new BlockLocation(2, 4, 3);

    let playerSim = test.spawnSimulatedPlayer(startPosPlayer, "playerSim_frog");
    let frogOne = test.spawn("minecraft:frog", startPosFrogOne);
    let frogTwo = test.spawn("minecraft:frog", startPosFrogTwo);
    const testEx = new GameTestExtensions(test);

    test
        .startSequence()
        .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.slimeBall, 2, 0))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogOne) == true, ""))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogTwo) == true, ""))
        .thenWait(() => {
            test.assertBlockPresent(MinecraftBlockTypes.frogSpawn, spawnPos, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 90).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "frog_egg_flow_water", (test) => { //This test verifies that frogs only lay egg on water that has a flat surface, and not on the "flowing" part of water
    const startPosFrogOne = new BlockLocation(1, 2, 1);
    const startPosFrogTwo = new BlockLocation(2, 2, 1);
    const startPosPlayer = new BlockLocation(1, 3, 3);
    const flatWaterPos = new BlockLocation(5, 4, 4); //This position is where the water is flat

    let playerSim = test.spawnSimulatedPlayer(startPosPlayer, "playerSim_frog");
    let frogOne = test.spawn("minecraft:frog", startPosFrogOne);
    let frogTwo = test.spawn("minecraft:frog", startPosFrogTwo);
    const testEx = new GameTestExtensions(test);

    test
        .startSequence()
        .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.slimeBall, 2, 0))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogOne) == true, ""))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogTwo) == true, ""))
        .thenWait(() => {
            test.assertBlockPresent(MinecraftBlockTypes.frogSpawn, flatWaterPos, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 90).tag(GameTest.Tags.suiteDefault);
