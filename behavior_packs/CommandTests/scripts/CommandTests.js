import * as GameTest from "GameTest";
import { BlockLocation, BlockTypes } from "Minecraft";

function runAsLlama(test) {
  const llamaEntityType = "llama";

  // spawn a llama in one cell
  test.spawn(llamaEntityType, new BlockLocation(4, 2, 2));

  // press a button which triggers a command block that "runs as llama" and moves them into a different block
  test.pressButton(new BlockLocation(2, 2, 2));
  test.succeedWhenEntityPresent(llamaEntityType, new BlockLocation(4, 2, 5)); // has the llama moved cells?
}
GameTest.register("CommandTests", "runAsLlama", runAsLlama).structureName("gametests:LlamaCommands");

function cloneBlocksCommand(test) {
  // clone some terracotta blocks
  test.pressButton(new BlockLocation(1, 2, 0));

  // clone the chest
  test.pressButton(new BlockLocation(1, 2, 3));

  // clone the andesite stairs
  test.pressButton(new BlockLocation(1, 2, 6));

  test.runAtTickTime(10, () => {
    test.assertBlockTypePresent(BlockTypes.purpleGlazedTerracotta, new BlockLocation(5, 2, 1));
    test.assertBlockTypePresent(BlockTypes.pinkGlazedTerracotta, new BlockLocation(6, 2, 2));
    test.assertBlockTypePresent(BlockTypes.log, new BlockLocation(5, 2, 2));

    // test that the chest was cloned.
    test.assertBlockTypePresent(BlockTypes.chest, new BlockLocation(5, 2, 4));
    test.assertBlockTypePresent(BlockTypes.chest, new BlockLocation(6, 2, 4));

    // test that the andesite stairs was cloned.
    test.assertBlockTypePresent(BlockTypes.andesiteStairs, new BlockLocation(5, 2, 8));
    test.assertBlockTypePresent(BlockTypes.andesiteStairs, new BlockLocation(6, 2, 8));
    test.assertBlockTypePresent(BlockTypes.andesiteStairs, new BlockLocation(5, 2, 9));
    test.assertBlockTypePresent(BlockTypes.andesiteStairs, new BlockLocation(6, 2, 9));
  });

  test.runAtTickTime(20, () => {
    // clone some terracotta again, but ensure cobblestone isn't overwritten with air
    test.pressButton(new BlockLocation(2, 2, 0));

    // clone the chest again
    test.pressButton(new BlockLocation(2, 2, 3));

    // clone just one of the andesite stairs using a filter
    test.pressButton(new BlockLocation(3, 2, 7));
  });

  test.runAtTickTime(30, () => {
    test.assertBlockTypePresent(BlockTypes.purpleGlazedTerracotta, new BlockLocation(8, 2, 1));
    test.assertBlockTypePresent(BlockTypes.pinkGlazedTerracotta, new BlockLocation(9, 2, 2));
    test.assertBlockTypePresent(BlockTypes.cobblestone, new BlockLocation(9, 2, 1));
    test.assertBlockTypePresent(BlockTypes.chest, new BlockLocation(5, 2, 4));
    test.assertBlockTypePresent(BlockTypes.purpleGlazedTerracotta, new BlockLocation(6, 2, 4));
    test.assertBlockTypePresent(BlockTypes.log, new BlockLocation(6, 2, 5));
    test.assertBlockTypePresent(BlockTypes.pinkGlazedTerracotta, new BlockLocation(7, 2, 5));

    // test that only one of the andesite stairs was cloned.
    test.assertBlockTypePresent(BlockTypes.air, new BlockLocation(8, 2, 8));
    test.assertBlockTypePresent(BlockTypes.air, new BlockLocation(9, 2, 8));
    test.assertBlockTypePresent(BlockTypes.air, new BlockLocation(8, 2, 9));
    test.assertBlockTypePresent(BlockTypes.andesiteStairs, new BlockLocation(9, 2, 9));
  });
  test.runAtTickTime(40, () => {
    test.succeed();
  });
}
GameTest.register("CommandTests", "cloneBlocksCommand", cloneBlocksCommand)
  .structureName("gametests:clone_command")
  .maxTicks(50);
