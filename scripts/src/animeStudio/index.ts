import { checkAnimeStudioParity } from "#src/services/genshinAssets/shared/checkAnimeStudioParity";
import { ANIMESTUDIO_CLI_ENVIRONMENT_VARIABLE } from "#src/services/genshinAssets/shared/constants";
import { buildAnimeStudio } from "#src/services/recreation/animeStudio/buildAnimeStudio";
import { TOOLS_DIRECTORY } from "#src/services/recreation/animeStudio/constants";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    args: {
      directory: {
        default: TOOLS_DIRECTORY,
        description: "Where the sources, the builds and the published CLI are kept, outside the repository",
        required: false,
        type: "string",
      },
      skipParity: {
        default: false,
        description: "Build without the parity check, only when the game's blocks are absent; the skip is printed",
        required: false,
        type: "boolean",
      },
    },
    meta: {
      description: `Build the asset CLI and its natives for macOS arm64, and print the path to set as ${ANIMESTUDIO_CLI_ENVIRONMENT_VARIABLE}`,
      name: "genshin:animestudio:build",
    },
    async run({ args }) {
      const cliPath = await buildAnimeStudio(args.directory, (stagedCliPath, outputDirectory) => {
        checkAnimeStudioParity(stagedCliPath, outputDirectory, args.skipParity);
      });
      console.log(`\nCLI published: ${cliPath}\nSet ${ANIMESTUDIO_CLI_ENVIRONMENT_VARIABLE} to it.`);
    },
  }),
);
