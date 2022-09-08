import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";

const TicksPerSecond = 20;
const runWalkTestTicks = 5 * TicksPerSecond;

function runWalkTest(test, args) {
  const spawnPosition = args["spawnPosition"];
  const targetPosition = args["targetPosition"];
  const CanTakeDamage = args["CanTakeDamage"];
  const shouldReachTarget = args["shouldReachTarget"];

  const entityType = "minecraft:villager_v2";
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>"; // Attempt to spawn the villagers as farmers

  let villager = test.spawnWithoutBehaviors(villagerEntitySpawnType, spawnPosition);
  test.walkTo(villager, targetPosition, 1);

  const startingHealth = villager.getComponent("minecraft:health").current;

  test.runAfterDelay(runWalkTestTicks - 1, () => {
    if (shouldReachTarget) {
      test.assertEntityPresent(entityType, targetPosition, true);
    } else {
      test.assertEntityPresent(entityType, targetPosition, false);
    }

    if (!CanTakeDamage && villager.getComponent("minecraft:health").current < startingHealth) {
      test.fail("The villager has taken damage");
    }

    test.succeed();
  });
}

GameTest.register("FireAvoidTests", "can_walk_around_lava", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(2, 3, 4),
    targetPosition: new BlockLocation(2, 3, 1),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_cut_corner_over_fire", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_cut_corner_over_fire_far", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(5, 2, 1),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_walk_into_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 1),
    CanTakeDamage: false,
    shouldReachTarget: false,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_walk_into_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: false,
    shouldReachTarget: false,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // Java villagers don't cross diagonal magma blocks
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "fire_maze", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(8, 2, 4),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDisabled); // villager gets caught on fire

GameTest.register("FireAvoidTests", "fire_maze_3d", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 3, 1),
    targetPosition: new BlockLocation(7, 2, 11),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(TicksPerSecond * 10)
  .tag(GameTest.Tags.suiteDisabled); // villager gets caught on fire

GameTest.register("FireAvoidTests", "golem_chase_zombie_over_fire", (test) => {
  const zombieLocation = new BlockLocation(7, 2, 1);
  const zombieType = "minecraft:zombie";
  test.spawnWithoutBehaviors(zombieType, zombieLocation);

  test.spawn("minecraft:iron_golem", new BlockLocation(1, 2, 2));

  // change the success condition because it would happen during the wandering behavior
  // The golem was not actually chasing the zombie
  test.succeedWhenEntityPresent(zombieType, zombieLocation, false);
})
  .maxTicks(TicksPerSecond * 10)
  .batch("night")
  .padding(10) // golem sends the zombie flying far so I added padding
  .tag("suite:java_parity") // golem does not run over the fire
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "villager_dont_flee_over_fire", (test) => {
  test.spawnWithoutBehaviors("minecraft:zombie", new BlockLocation(5, 2, 1));
  const villager = test.spawn("minecraft:villager_v2", new BlockLocation(4, 2, 1));

  const startingHealth = villager.getComponent("minecraft:health").current;

  test.runAfterDelay(runWalkTestTicks - 1, () => {
    if (villager.getComponent("minecraft:health").current < startingHealth) {
      test.fail("The villager has taken damage");
    }

    test.succeed();
  });
})
  .maxTicks(TicksPerSecond * 5)
  .batch("night")
  .tag("suite:java_parity") // villager runs into the fire, but in Java does not
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_far_out_of_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(4, 2, 1),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_far_out_of_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 3),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_out_of_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 1),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_out_of_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "zombie_chase_villager_over_fire", (test) => {
  test.spawnWithoutBehaviors("minecraft:villager_v2", new BlockLocation(5, 2, 1));
  const zombie = test.spawn("minecraft:zombie", new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent("minecraft:zombie", new BlockLocation(4, 2, 1), true);
})
  .maxTicks(TicksPerSecond * 10)
  .batch("night")
  .tag(GameTest.Tags.suiteDefault);
