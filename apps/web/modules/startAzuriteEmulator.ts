import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

// Imported by source rather than by package name: `nuxt prepare` loads every module from the app's `postinstall`, before
// Any workspace package is built, and the package name resolves to a `dist` a fresh clone does not have yet
import { spawn } from "../../../packages/shared-node/src/childProcess.ts";

// The local Azure Storage emulator, started under `nuxt dev` alone and only when the storage connection string is the
// Emulator's, so a developer pointed at the real dev account runs nothing locally. Its data is kept beside the app in
// `.azurite`, which the root .gitignore names, and it stops with the dev server
const EMULATOR_CONNECTION_STRING = "UseDevelopmentStorage=true";

export default defineNuxtModule({
  meta: { name: "start-azurite-emulator" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING !== EMULATOR_CONNECTION_STRING) return;
    // The emulator's entry is run by Node directly rather than through a shell, so stopping it stops the emulator itself
    const require = createRequire(import.meta.url);
    const manifestPath = require.resolve("azurite/package.json");
    const { bin } = require(manifestPath) as { bin: { azurite: string } };
    const emulatorArguments = [
      join(dirname(manifestPath), bin.azurite),
      "--silent",
      "--skipApiVersionCheck",
      "--location",
      join(nuxt.options.rootDir, ".azurite"),
    ];
    const emulator = spawn(process.execPath, emulatorArguments, { stdio: "inherit" });
    nuxt.hook("close", () => {
      emulator.kill();
    });
  },
});
