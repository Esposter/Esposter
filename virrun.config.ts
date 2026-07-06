// Import `virrun/config` (the ~1 kB defineConfig entry), never the `virrun` barrel — jiti transpiles this file's
// Imports on every `virrun -- <cmd>` (unconfig disables jiti's fs cache), and the barrel measures ~11 s vs ~0.4 s.
import type { VirrunConfigurationInput } from "virrun/config";

import { defineConfig } from "virrun/config";
// Linux (CI runners, local Linux shells) runs the toolchain native — it already generates platform-correct artifacts
// (e.g. `.nuxt`) in place, so the sandbox would only add overhead. win32 keeps the WSL os backend: the host's
// Win32-generated `.nuxt` misfires Linux type-aware tooling, so sandboxed commands need the Linux-generated prepare
// Layer. resolveBackend still owns capability degradation (os → native when bubblewrap is unavailable).
const virrunConfiguration: VirrunConfigurationInput = defineConfig({
  backend: process.platform === "win32" ? "os" : "native",
  environment: "nuxt",
});

export default virrunConfiguration;
