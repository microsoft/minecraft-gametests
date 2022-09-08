import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  BlockProperties,
  MinecraftItemTypes,
  Direction,
  world,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const DOWN = Direction.down;
const UP = Direction.up;
const NORTH = Direction.north;
const SOUTH = Direction.south;
const WEST = Direction.west;
const EAST = Direction.east;
const DIRECTIONS = [DOWN, UP, NORTH, SOUTH, WEST, EAST];

function growLichen(test, lichenPos, faceToGrow, growDirection) {
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, lichenPos, true);
  // multiface directions used in actual spreadFromFaceTowardDirection - pass in unmapped directions
  test.spreadFromFaceTowardDirection(lichenPos, faceToGrow, growDirection);
}

function assertNoLichen(test, pos) {
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, false);
}

function assertLichen(test, pos, waterlogged, ...faces) {
  const testEx = new GameTestExtensions(test);

  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, true);
  test.assertIsWaterlogged(pos, waterlogged);

  const glowLichenWorldPos = test.worldBlockLocation(pos);
  const glowLichenBlock = test.getDimension().getBlock(glowLichenWorldPos);
  const glowLichenPermutation = glowLichenBlock.permutation;
  const glowLichenmultiFaceDirectionBits = glowLichenPermutation.getProperty(
    BlockProperties.multiFaceDirectionBits
  ).value;

  for (const face of DIRECTIONS) {
    // No need to convert face because not comparing to mapped Multiface direction
    const expectFaceBit = faces.indexOf(face) != -1 ? 1 : 0;
    const actualFaceBit = (glowLichenmultiFaceDirectionBits & (1 << testEx.getMultiFaceDirection(face))) != 0 ? 1 : 0;
    test.assert(
      actualFaceBit == expectFaceBit,
      `Unexpected face bit in the direction: ${face}. Expected: ${expectFaceBit}. Actual: ${actualFaceBit}`
    );
  }
}

///
// Concrete Tests
///
GameTest.register("MultifaceTests", "spread_sideways_within_same_corner", (test) => {
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH, WEST);

  assertLichen(test, new BlockLocation(4, 3, 0), false, UP, SOUTH);
  growLichen(test, new BlockLocation(4, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(4, 3, 0), false, UP, SOUTH, WEST);

  assertLichen(test, new BlockLocation(7, 3, 0), false, UP, EAST, SOUTH);
  growLichen(test, new BlockLocation(7, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(7, 3, 0), false, UP, EAST, SOUTH, WEST);

  assertLichen(test, new BlockLocation(11, 3, 0), false, UP, EAST, DOWN, SOUTH);
  growLichen(test, new BlockLocation(11, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(11, 3, 0), false, UP, EAST, DOWN, SOUTH, WEST);

  growLichen(test, new BlockLocation(15, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(15, 3, 0), false, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_up_within_same_corner", (test) => {
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH, UP);

  assertLichen(test, new BlockLocation(4, 3, 0), false, WEST, SOUTH);
  growLichen(test, new BlockLocation(4, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(4, 3, 0), false, WEST, SOUTH, UP);

  assertLichen(test, new BlockLocation(7, 3, 0), false, EAST, DOWN, SOUTH);
  growLichen(test, new BlockLocation(7, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(7, 3, 0), false, EAST, DOWN, SOUTH, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_around_partly_blocked_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  assertNoLichen(test, new BlockLocation(0, 3, 0));
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_toward_opposite_face", (test) => {
  growLichen(test, new BlockLocation(1, 3, 1), EAST, WEST);
  assertLichen(test, new BlockLocation(1, 3, 1), false, EAST);
  assertNoLichen(test, new BlockLocation(0, 3, 1));

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_ceiling", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 1), UP, WEST);
  assertLichen(test, new BlockLocation(1, 3, 1), false, UP);
  assertLichen(test, new BlockLocation(0, 3, 1), false, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_wall_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_ceiling_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 4, 1));
  growLichen(test, new BlockLocation(1, 3, 1), UP, WEST);
  assertLichen(test, new BlockLocation(0, 4, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_floor_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 4, 1), DOWN, WEST);
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_floor", (test) => {
  assertNoLichen(test, new BlockLocation(0, 4, 1));
  growLichen(test, new BlockLocation(1, 4, 1), DOWN, WEST);
  assertLichen(test, new BlockLocation(0, 4, 1), false, DOWN);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_toward_same_face", (test) => {
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, SOUTH);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 3, 1));
  assertNoLichen(test, new BlockLocation(1, 3, 2));

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_wall", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 0));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(0, 3, 0), false, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_water_to_air", (test) => {
  assertNoLichen(test, new BlockLocation(1, 3, 1));
  growLichen(test, new BlockLocation(1, 2, 1), SOUTH, UP);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);
  assertLichen(test, new BlockLocation(1, 3, 1), false, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_air_to_water", (test) => {
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  growLichen(test, new BlockLocation(1, 3, 1), SOUTH, DOWN);
  assertLichen(test, new BlockLocation(1, 3, 1), false, SOUTH);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_within_water", (test) => {
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);

  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, EAST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_into_flowing_water", (test) => {
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  test.assertBlockPresent(MinecraftBlockTypes.flowingWater, new BlockLocation(1, 2, 1), true);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_into_lava", (test) => {
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), false, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  test.assertBlockPresent(MinecraftBlockTypes.flowingLava, new BlockLocation(1, 2, 1), true);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "break_if_all_supporting_faces_destroyed", (test) => {
  const testEx = new GameTestExtensions(test);
  // break the supporting block behind the non-waterlogged lichen
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(1, 2, 2)); //Use setBlockType(air) instead of breakBlock()

  // break the supporting block behind the waterlogged lichen
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(4, 2, 2)); //Use setBlockType(air) instead of breakBlock()

  test.succeedWhen(() => {
    // check that the non-waterlogged lichen was replaced with air, and that no glow lichen was dropped
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 2), true);
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
    test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(1, 2, 1), 1, 0);

    // check that the waterlogged lichen was replaced with water, and that no glow lichen was dropped
    test.assertBlockPresent(MinecraftBlockTypes.water, new BlockLocation(4, 2, 2), true);
    testEx.assertBlockProperty("liquid_depth", 1, new BlockLocation(4, 2, 2));
    test.assertBlockPresent(MinecraftBlockTypes.water, new BlockLocation(4, 2, 1), true);
    testEx.assertBlockProperty("liquid_depth", 0, new BlockLocation(4, 2, 1));
    test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(4, 2, 2), 1, 0);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "remove_face_if_support_destroyed", (test) => {
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(1, 3, 1)); //Use setBlockType(air) instead of breakBlock()

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 3, 1), true);
      assertLichen(test, new BlockLocation(1, 3, 0), false, WEST);
      test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(1, 2, 0), 1, 0);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "remove_if_has_no_faces", (test) => {
  const pos = new BlockLocation(0, 2, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  glowLichenPermutation.getProperty(BlockProperties.multiFaceDirectionBits).value = 0;
  test.setBlockPermutation(glowLichenPermutation, pos);

  // Make sure the glow lichen was placed
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, true);

  // Update a neighbor
  test.setBlockType(MinecraftBlockTypes.blackstone, pos.offset(1, 0, 0));

  // Succeed if the glow lichen was removed
  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, pos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "default_multiface_block_has_all_sides", (test) => {
  const pos = new BlockLocation(0, 1, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  test.setBlockPermutation(glowLichenPermutation, pos);

  // Make sure the glow lichen was placed
  assertLichen(test, pos, false, DOWN, UP, NORTH, SOUTH, WEST, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);
