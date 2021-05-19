import { BlockLocation } from "Minecraft";

// ======= UTILITIES =================================================================================================

export class Utilities {
  static fillBlock(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let i = xFrom; i <= xTo; i++) {
      for (let j = yFrom; j <= yTo; j++) {
        for (let k = zFrom; k <= zTo; k++) {
          test.setBlock(blockType, new BlockLocation(i, j, k));
        }
      }
    }
  }

  static addFourWalls(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let i = xFrom; i <= xTo; i++) {
      for (let k = yFrom; k <= yTo; k++) {
        test.setBlock(blockType, new BlockLocation(i, k, zFrom));
        test.setBlock(blockType, new BlockLocation(i, k, zTo));
      }
    }

    for (let j = zFrom + 1; j < zTo; j++) {
      for (let k = yFrom; k <= yTo; k++) {
        test.setBlock(blockType, new BlockLocation(xFrom, k, j));
        test.setBlock(blockType, new BlockLocation(xTo, k, j));
      }
    }
  }

  static addFourNotchedWalls(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let i = xFrom + 1; i < xTo; i++) {
      for (let k = yFrom; k <= yTo; k++) {
        test.setBlock(blockType, new BlockLocation(i, k, zFrom));
        test.setBlock(blockType, new BlockLocation(i, k, zTo));
      }
    }

    for (let j = zFrom + 1; j < zTo; j++) {
      for (let k = yFrom; k <= yTo; k++) {
        test.setBlock(blockType, new BlockLocation(xFrom, k, j));
        test.setBlock(blockType, new BlockLocation(xTo, k, j));
      }
    }
  }

  static assertEntityNotInSpecificArea(test, entityType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    let count = 0;

    for (let i = xFrom; i <= xTo; i++) {
      for (let j = yFrom; j <= yTo; j++) {
        for (let k = zFrom; k <= zTo; k++) {
          try {
            test.assertEntityNotPresent(entityType, new BlockLocation(i, j, k));
          } catch (Exception) {
            count++;
          }
        }
      }
    }

    if (count > 0) {
      throw Error("Entity of type '" + entityType + "' found (" + count + ")");
    }
  }

  static assertEntityInSpecificArea(test, entityType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    let count = 0;

    for (let i = xFrom; i <= xTo; i++) {
      for (let j = yFrom; j <= yTo; j++) {
        for (let k = zFrom; k <= zTo; k++) {
          try {
            test.assertEntityNotPresent(entityType, new BlockLocation(i, j, k));
          } catch (Exception) {
            count++;
          }
        }
      }
    }

    if (count == 0) {
      throw Error("Entity of type '" + entityType + "' was not found (" + count + ")");
    }
  }
}
