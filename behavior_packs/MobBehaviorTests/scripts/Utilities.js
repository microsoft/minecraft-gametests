import { BlockLocation } from "@minecraft/server";

// ======= UTILITIES =================================================================================================

export class Utilities {
  static fillBlock(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let xCoord = xFrom; xCoord <= xTo; xCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        for (let zCoord = zFrom; zCoord <= zTo; zCoord++) {
          test.setBlockType(blockType, new BlockLocation(xCoord, yCoord, zCoord));
        }
      }
    }
  }

  static addFourWalls(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let xCoord = xFrom; xCoord <= xTo; xCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        test.setBlockType(blockType, new BlockLocation(xCoord, yCoord, zFrom));
        test.setBlockType(blockType, new BlockLocation(xCoord, yCoord, zTo));
      }
    }

    for (let zCoord = zFrom + 1; zCoord < zTo; zCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        test.setBlockType(blockType, new BlockLocation(xFrom, yCoord, zCoord));
        test.setBlockType(blockType, new BlockLocation(xTo, yCoord, zCoord));
      }
    }
  }

  static addFourNotchedWalls(test, blockType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    for (let xCoord = xFrom + 1; xCoord < xTo; xCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        test.setBlockType(blockType, new BlockLocation(xCoord, yCoord, zFrom));
        test.setBlockType(blockType, new BlockLocation(xCoord, yCoord, zTo));
      }
    }

    for (let zCoord = zFrom + 1; zCoord < zTo; zCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        test.setBlockType(blockType, new BlockLocation(xFrom, yCoord, zCoord));
        test.setBlockType(blockType, new BlockLocation(xTo, yCoord, zCoord));
      }
    }
  }

  static assertEntityNotInSpecificArea(test, entityType, xFrom, yFrom, zFrom, xTo, yTo, zTo) {
    let count = 0;

    for (let xCoord = xFrom; xCoord <= xTo; xCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        for (let zCoord = zFrom; zCoord <= zTo; zCoord++) {
          try {
            test.assertEntityPresent(entityType, new BlockLocation(xCoord, yCoord, zCoord), false);
          } catch (Exception) {
            count++;
            i, j, k;
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

    for (let xCoord = xFrom; xCoord <= xTo; xCoord++) {
      for (let yCoord = yFrom; yCoord <= yTo; yCoord++) {
        for (let zCoord = zFrom; zCoord <= zTo; zCoord++) {
          try {
            test.assertEntityPresent(entityType, new BlockLocation(xCoord, yCoord, zCoord), false);
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
