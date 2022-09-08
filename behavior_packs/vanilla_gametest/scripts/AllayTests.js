import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, TicksPerSecond, ItemStack, Location } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TEST_MAX_TICKS = TicksPerSecond * 10;

GameTest.register("AllayTests", "allay_pickup_item", (test) => {
    const startPosAllay = new BlockLocation(1, 2, 1);
    const startPosPlayer = new BlockLocation(3, 2, 1);
    const torchItem = new ItemStack(MinecraftItemTypes.torch, 1, 0);
    test.spawnItem(torchItem, new Location(4.5, 2.5, 4.5));
    let playerSim = test.spawnSimulatedPlayer(startPosPlayer, "playerSim_allay");
    let allay = test.spawn("minecraft:allay", startPosAllay);
    const testEx = new GameTestExtensions(test);

    test
        .startSequence()
        .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.torch, 1, 0))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(allay) == true, ""))
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:item", false); // Make sure the torch is picked up.
        })
        .thenSucceed();
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// Tests that an Allay can leave a vertically partial block it got stuck into (e.g. lantern).
GameTest.register("AllayTests", "allay_unstucks_from_lantern", (test) => {
    // Really make sure it's stuck up in the lanterns.  
    const spawnPos = new Location(5.75, 4.25, 2.5);
    const allayEntityType = "minecraft:allay";
    const allay = test.spawnWithoutBehaviorsAtLocation(allayEntityType, spawnPos);

    const targetPos = new BlockLocation(2, 2, 2);
    test.walkTo(allay, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(allayEntityType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// Tests that an Allay can leave a horizontally partial block it got stuck into (e.g. fence).
GameTest.register("AllayTests", "allay_unstucks_from_fence", (test) => {
    const spawnPos = new Location(5.75, 3, 2.5);
    const allayEntityType = "minecraft:allay";
    const allay = test.spawnWithoutBehaviorsAtLocation(allayEntityType, spawnPos);

    const targetPos = new BlockLocation(2, 2, 2);
    test.walkTo(allay, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(allayEntityType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);
