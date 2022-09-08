import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes } from "mojang-minecraft";

function locToStr(loc) {
  return [loc.x.toFixed(3), loc.y.toFixed(3), loc.z.toFixed(3)].join(", ");
}

function locationToBlockLocation(loc) {
  return new BlockLocation(Math.floor(loc.x), Math.floor(loc.y), Math.floor(loc.z));
}

// because of the barrier blocks, these positions are offset (2, 0, 40) from the Java tests
GameTest.register("TntTests", "cannon", (test) => {
  const projectilePosition = new BlockLocation(3, 10, 41);
  const chargePosition = new BlockLocation(3, 10, 43);

  for (var i = 0; i < 5; i++) {
    var chargeTnt = test.spawn("minecraft:tnt", chargePosition);
    test.setTntFuse(chargeTnt, 20);
  }

  var projectiles = new Array(5);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      for (var projectile of projectiles) {
        projectile = test.spawn("minecraft:tnt", projectilePosition);
        test.setTntFuse(projectile, 30);
      }
    })
    .thenExecuteAfter(1, () => {
      test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 10, 40));
    })
    .thenExecuteFor(19, () => {
      const expectedBlockLocation = locationToBlockLocation(projectiles[0].location);
      const expectedVelocity = projectiles[0].velocity;

      for (var i = 1; i < projectiles.length; i++) {
        const blockLoc = locationToBlockLocation(projectiles[i].location);
        if (!blockLoc.equals(expectedBlockLocation)) {
          test.fail(
            "All projectile tnt should be in the same location, but they have spread apart. Expected " +
              locToStr(expectedBlockLocation) +
              ", but got " +
              locToStr(blockLoc)
          );
        }

        if (!projectiles[i].velocity.equals(expectedVelocity)) {
          test.fail(
            "All projectile tnt should have the same velocity, but they do not. Expected " +
              locToStr(expectedVelocity) +
              ", but got " +
              locToStr(projectiles[i].velocity)
          );
        }

        // java tests the projectiles are still "alive". This seems unecessary because the TNT shouldn't be moving unless it is alive.
      }
    })
    .thenExecute(() => {
      const expectedLocation = new BlockLocation(3, 14, 4);
      for (const projectile of projectiles) {
        test.assertEntityInstancePresent(projectile, expectedLocation);
      }
    })
    .thenSucceed();
})
  .maxTicks(30)
  .tag("suite:java_parity");

GameTest.register("TntTests", "bedrock_cannon", (test) => {
  const projectilePosition = new BlockLocation(3, 9, 19);
  const chargePosition = new BlockLocation(3, 9, 22);

  for (var i = 0; i < 5; i++) {
    var chargeTnt = test.spawn("minecraft:tnt", chargePosition);
    test.setTntFuse(chargeTnt, 20);
  }

  var projectile = null;

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      for (var i = 0; i < 5; i++) {
        projectile = test.spawn("minecraft:tnt", projectilePosition);
        test.setTntFuse(projectile, 15);
      }
    })
    .thenExecuteAfter(10, () => {
      test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(3, 9, 18));
    })
    .thenExecuteAfter(5, () => {
      const expectedLocation = new BlockLocation(3, 9, 7);

      test.assertEntityInstancePresent(projectile, expectedLocation);
    })
    .thenSucceed();
})
  .maxTicks(26)
  .tag(GameTest.Tags.suiteDefault);
