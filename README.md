# Project

This repo contains sample GameTest behavior files for Minecraft Bedrock Edition. Minecraft supports GameTests - a combination of JavaScript + MCStructures - for validating facets of Minecraft behavior. You can use GameTests to validate facets of your creations, as well!

## Getting started with GameTest

To get started with GameTest Framework in Minecraft, see this [GameTest Framework Introduction](https://aka.ms/gametest) page.

A tutorial for creating your first GameTest is available [here](https://aka.ms/newgametest). The sample code for the tutorial is within this repo, at [/behavior_packs/StarterTestsTutorial](https://github.com/microsoft/minecraft-gametests/tree/main/behavior_packs/StarterTestsTutorial).

## Behavior packs & tests

#### NOTE: The main branch is compatible with the latest released main version of Minecraft. The beta branch is generally compatible with the latest updated beta version of Minecraft.

| Name                 | Link                                                                                                   | Description                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| StarterTestsTutorial | [Open](https://github.com/microsoft/minecraft-gametests/tree/main/behavior_packs/StarterTestsTutorial) | Starter "Hello World" sample used in the tutorial at https://aka.ms/newgametest. |
| MobBehaviorTests     | [Open](https://github.com/microsoft/minecraft-gametests/tree/main/behavior_packs/MobBehaviorTests)     | Simple tests of interesting mob behaviors.                                       |

## Using these behavior packs

To use these behavior packs with an installed Windows 10 version of Minecraft Bedrock Edition:

1. Copy the desired behavior packs into the `development_behavior_packs` (`%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs`) folder
2. Create a new world in Minecraft with the following options:

- Enable the GameTest Framework Experiment
- Set to Creative mode
- Add the desired Behavior packs

## Contributing

This project welcomes contributions and suggestions. For the GameTests you'd like to submit for inclusion in this sample repo, please make sure:

- the GameTest(s) are small and self contained
- can run in a short amount of time, with clear pass/fail criteria
- are generally passing, or used to document an unexpected failure and are tagged as such (with the .tag function on .register)
- do not have any external dependencies (e.g., on extra behavior or resource packs)
- for JavaScript, that files are formatted consistent with the settings defined in prettierrc.json (mainly, two-space indentation)

Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com. When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
