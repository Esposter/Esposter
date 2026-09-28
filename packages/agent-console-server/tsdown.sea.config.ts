import type { UserConfig } from "tsdown";

import { defineConfig } from "tsdown";

// The host as one file with every dependency inside it, the input Node's --build-sea embeds into the Windows
// Executable the installer ships: the executable carries its own runtime, so nothing outside it is resolved. node-pty
// Alone stays out, since its native addons and the files it forks are loaded from the copy the install writes out
const tsdownSeaConfiguration: UserConfig = defineConfig({
  deps: { alwaysBundle: [/^(?!node-pty$).*/u], neverBundle: ["node-pty"] },
  dts: false,
  entry: { host: "src/cli.ts" },
  format: "esm",
  outDir: "dist-sea",
  platform: "node",
});

export default tsdownSeaConfiguration;
