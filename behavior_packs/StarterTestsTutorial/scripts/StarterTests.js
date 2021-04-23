import * as GameTest from "GameTest";
import { BlockLocation } from "Minecraft";

GameTest.register("StarterTests", "simpleMobTest", (test) => {
  const attackerId = "fox";
  const victimId = "chicken";

  test.spawn(attackerId, new BlockLocation(5, 2, 5));
  test.spawn(victimId, new BlockLocation(2, 2, 2));

  test.assertEntityPresentInArea(victimId);

  // Succeed when the victim dies
  test.succeedWhen(() => {
    test.assertEntityNotPresentInArea(victimId);
  });
})
  .maxTicks(400)
  .structureName("startertests:mediumglass"); /* use the mediumglass.mcstructure file */
