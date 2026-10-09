import { buildAnimeStudio } from "#src/services/animeStudio/buildAnimeStudio";
import { SITE_NAME } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { homedir } from "node:os";
import { join } from "node:path";

await runMain(
  defineCommand({
    args: {
      directory: {
        default: join(homedir(), SITE_NAME, "tools"),
        description: "Where the sources, the builds and the published CLI are kept, outside the repository",
        required: false,
        type: "string",
      },
    },
    meta: {
      description:
        "Build the asset CLI and its natives for macOS arm64, and print the path to set as GENSHIN_ANIMESTUDIO_CLI",
      name: "genshin:animestudio:build",
    },
    async run({ args }) {
      const cliPath = await buildAnimeStudio(args.directory);
      console.log(`\nCLI published: ${cliPath}\nSet GENSHIN_ANIMESTUDIO_CLI to it.`);
    },
  }),
);
