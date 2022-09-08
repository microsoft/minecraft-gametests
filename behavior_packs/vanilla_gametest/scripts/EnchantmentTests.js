import * as GameTest from "mojang-gametest";
import {
	BlockLocation,
	Direction,
	ItemStack,
	Location,
	MinecraftBlockTypes,
	MinecraftItemTypes,
	world,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";


const ticksPerSecond = 20;

GameTest.register("EnchantmentTests", "frostwalker_freezes_water", (test) => {
		
	const spawnLoc = new BlockLocation(5, 5, 2);
	const landLoc = new BlockLocation(5, 3, 2);
	const iceLoc = new BlockLocation(3, 2, 2);
	const playerName = "Test Player";
	const player = test.spawnSimulatedPlayer(spawnLoc, playerName);	

	test
    .startSequence()
	.thenIdle(10) //Frostwalker boots added here through a dispenser
	.thenExecute(() => {
		player.move(-1, 0);
	})
    .thenExecuteAfter(ticksPerSecond, () => {
		test.assertBlockPresent(MinecraftBlockTypes.frostedIce, iceLoc, true);
    })
    .thenSucceed();
})
	.structureName("EnchantmentTests:FrostWalkerFreezesWater")
	.maxTicks(ticksPerSecond * 3)
	.tag(GameTest.Tags.suiteDefault);

GameTest.register("EnchantmentTests", "spectator_with_frostwalker_doesnt_freeze_water", (test) => {
		
	const spawnLoc = new BlockLocation(5, 5, 2);
	const landLoc = new BlockLocation(5, 3, 2);
	const waterLoc = new BlockLocation(3, 2, 2);
	const playerName = "Test Player";
	const player = test.spawnSimulatedPlayer(spawnLoc, playerName);	

	test
    .startSequence()
	.thenIdle(60) //Frostwalker boots added here through a dispenser
	.thenExecute(() => {
		player.runCommand("gamemode spectator");
		player.move(-1, 0);
	})
	.thenIdle(10)
	.thenExecute(() => {
		player.setGameMode(1);
		player.stopMoving();
	})
    .thenExecuteAfter(ticksPerSecond, () => {
		test.assertBlockPresent(MinecraftBlockTypes.water, waterLoc, true);
    })
    .thenSucceed();
})
	.structureName("EnchantmentTests:SpecFrstWlkFreeze")
	.maxTicks(ticksPerSecond * 5)
	//remove this when deexperimentifying
	//.tag(GameTest.Tags.suiteDefault);

