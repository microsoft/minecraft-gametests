// Copyright (c) Microsoft Corporation.  All rights reserved.

import "AllayTests.js";
import "APITests.js";
import "BlockEventTests.js";
import "BlockTests.js";
import "ComponentTests.js";
import "CommandTests.js";
import "DebugTests.js";
import "DispenserTests.js";
import "DoorTests.js";
import "DripstoneTests.js";
import "DuplicationTests.js";
import "EntityQueryTests.js";
import "EntityTests.js";
import "ExtensionTests.js";
import "FireAvoidTests.js";
import "FrogTests.js";
import "GameTestExtensions.js";
import "MinecartTests.js";
import "MobTests.js";
import "MultifaceTests.js";
import "PathFindingTests.js";
import "FlyingMachineTests.js";
import "PistonTests.js";
import "TntTests.js";
import "WaterPathfindingTests.js";
import "WardenTests.js";
import "SmallMobTests.js";
import "BigMobTests.js";
import "RaycastingTests.js";
import "RedstoneTests.js";
import "SimulatedPlayerTests.js";
import "RespawnAnchorTests.js";
import "PlaceSeedsTests.js";
import "ItemTests.js";
import "ItemEnchantmentsTests.js";
import "SculkTests.js";
import "VibrationTests.js";
import "EnchantmentTests.js";

import { system } from "@minecraft/server";
system.events.beforeWatchdogTerminate.subscribe((e) => {
  e.cancel = true;
});
