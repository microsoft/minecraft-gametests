import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes } from "mojang-minecraft";

let respawnanchor_explosion = (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 2));
  const anchorPos = new BlockLocation(1, 2, 2);
  const woolPos = anchorPos.above();

  test
    .startSequence()
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.respawnAnchor, anchorPos);
      test.assertBlockPresent(MinecraftBlockTypes.wool, woolPos);
    })
    .thenExecuteAfter(5, () => {
      player.interactWithBlock(anchorPos)
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.water, anchorPos);
      test.assertBlockPresent(MinecraftBlockTypes.wool, woolPos);
    })
    .thenSucceed();
};

GameTest.register("RespawnAnchorTests", "inwater_explosion_not_destructive", (test) => respawnanchor_explosion(test))
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RespawnAnchorTests", "waterlogged_neighbour_explosion", (test) => respawnanchor_explosion(test))
  // Having waterlogged neighbour blocks counts as being in water
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RespawnAnchorTests", "onland_explosion_destructive", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 1));
  const anchorPos = new BlockLocation(1, 2, 1);
  const woolPos = anchorPos.above();

  test
    .startSequence()
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.respawnAnchor, anchorPos);
      test.assertBlockPresent(MinecraftBlockTypes.wool, woolPos);
    })
    .thenExecuteAfter(5, () => {
      player.interactWithBlock(anchorPos)
    })
    .thenWait(() => {
      test.assertBlockState(anchorPos, (block) => {
        return block.type == MinecraftBlockTypes.air || block.type == MinecraftBlockTypes.fire
      })
      test.assertBlockPresent(MinecraftBlockTypes.air, woolPos);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);
