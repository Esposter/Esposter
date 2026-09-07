import type { NuxtConfig } from "nuxt/schema";

// Everything Nuxt should not walk, in one explicit list. These resolve into Nuxt's own defaults rather than
// Replacing them, so this file only ever adds to the rule set — and `.nuxtignore`, which Nuxt merges into the same
// Option, would be a second place to look for the same answer.
export const ignore: NuxtConfig["ignore"] = [
  // Build tooling that happens to sit inside the app, not app source.
  "scripts",
  // The defaults already exclude `*.{spec,test}.*`, which is why the `.test.ts` fixture helpers beside the
  // Composables are not auto-imports. Nothing there covers `*.bench.ts`, so every bench fixture was registered as
  // A global and a component could reference `benchRows10k` or `generateBenchRows` with no import and typecheck.
  "**/*.bench.{js,cts,mts,ts,jsx,tsx}",
];
