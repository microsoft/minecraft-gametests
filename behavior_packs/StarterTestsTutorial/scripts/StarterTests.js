import * as GameTest from "GameTest";
import { BlockLocation } from "Minecraft";
        
function simpleMobTest(test) 
{  
        const attackerType = "fox";
        const victimType = "chicken";
        
        test.spawn(attackerType, new BlockLocation(5, 2, 5));
        test.spawn(victimType, new BlockLocation(2, 2, 2));
        
        // wait 20 seconds, then check whether the victim still exists
        test.runAtTickTime(400, () =>{
                        assertEntityNotInArea(test, victimType, 1, 1, 1, 10, 9, 10);
                        test.succeed();
        });
}

/// Registration Code for our test
GameTest.register("StarterTests", "simpleMobTest", simpleMobTest)
        .maxTicks(410)
        .structureName("startertests:mediumglass");   /* use the mediumglass.mcstructure file */


/// Helper Function that will throw an error and stop further execution if it finds a mob
/// in an area.
function assertEntityNotInArea(test, entityType, xFrom, yFrom, zFrom, xTo, yTo, zTo)
{
        for (let i=xFrom; i<=xTo; i++)
        {
                for (let j=yFrom; j<=yTo; j++)
                {
                        for (let k=zFrom; k<=zTo; k++)
                        {
                                test.assertEntityNotPresent(entityType, new BlockLocation(i, j, k));
                        }
                }
        }
}
        
        