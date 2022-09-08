import { Direction } from "mojang-minecraft";
import { ItemStack } from "mojang-minecraft";

export default class GameTestExtensions {
  constructor(test) {
    this.test = test;
  }

  addEntityInBoat(entityType, blockLoc) {
    const boat = this.test.spawn("boat", blockLoc);
    this.test.assert(boat !== undefined, "Failed to spawn boat");
    const rider = this.test.spawn(entityType, blockLoc);
    this.test.assert(rider !== undefined, "Failed to spawn rider");
    const boatRideableComp = boat.getComponent("rideable");
    this.test.assert(boatRideableComp !== undefined, "Boat missing rideable component");
    this.test.assert(boatRideableComp.addRider(rider), "Failed to add rider");
    return rider;
  }

  makeAboutToDrown(entity) {
    this.test.assert(entity !== undefined, "Expected entity");
    const healthComp = entity.getComponent("health");
    this.test.assert(healthComp !== undefined, "Entity missing health component");
    const breathableComp = entity.getComponent("breathable");
    this.test.assert(breathableComp !== undefined, "Entity missing breathable component");
    healthComp.setCurrent(1);
    breathableComp.setAirSupply(0);
  }

  assertBlockProperty(propertyName, value, blockLocation) {
    this.test.assertBlockState(blockLocation, (block) => {
      return block.permutation.getProperty(propertyName).value == value;
    });
  }

  giveItem(player, itemType, amount, slot) {
    const inventoryContainer = player.getComponent("inventory").container;
    inventoryContainer.addItem(new ItemStack(itemType, amount ?? 1));
    player.selectedSlot = slot ?? 0;
  }

  getVineDirection(direction) {
    switch (direction) {
      case Direction.north:
        return 2;
      case Direction.east:
        return 3;
      case Direction.south:
        return 0;
      case Direction.west:
        return 1;
    }
  }
  
  getMultiFaceDirection(direction) {
    switch (direction) {
      case Direction.down:
        return 0;
      case Direction.up:
        return 1;
      case Direction.north:
        return 4;
      case Direction.east:
        return 5;
      case Direction.south:
        return 2;
      case Direction.west:
        return 3;
    }
  }

  rotateVolume(volume) {
    switch (this.test.getTestDirection()) {
      case Direction.east:
        volume.z = -volume.z;
        break;
      case Direction.west:
        volume.x = -volume.x;
        break;
      case Direction.north:
        volume.x = -volume.x;
        volume.z = -volume.z;
        break;
    }
    return volume;
  }

  rotateAngle(angle) {
    switch (this.test.getTestDirection()) {
      case Direction.east:
        angle -= 90;
        break;
      case Direction.west:
        angle -= 270;
        break;
      case Direction.north:
        angle -= 180;
        break;
    }
    if (angle < -180) {
      angle += 360;
    }
    return angle;
  }
}
