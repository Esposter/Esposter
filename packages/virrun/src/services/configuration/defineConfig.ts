import type { VirrunConfigurationInput } from "#src/models/virrun/VirrunConfigurationInput";
// The vitest-style author-facing helper for `virrun.config.ts`: a typed identity function, so
// `export default defineConfig({ ... })` gets full editor intelligence without a `$schema` pointer. The TS config
// File is where platform branching lives (e.g. `backend: process.platform === "linux" ? "native" : "os"`) — the
// Author writes the `process.platform` expression inline; no context parameter is needed. Field values are the raw
// Enum strings (VirrunConfigurationInput), so the config imports nothing but this helper; the zero-runtime-import
// Alternative is `export default { ... } satisfies VirrunConfigurationInput` via `import type`.
export const defineConfig = (configuration: VirrunConfigurationInput): VirrunConfigurationInput => configuration;
