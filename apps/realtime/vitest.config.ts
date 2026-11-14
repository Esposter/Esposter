import type { Plugin, ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { readFileSync } from "node:fs";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname);

// The object migrations import each `.sql` file, which the build bundles as text, so a test loads it as the same string
const sqlTextPlugin: Plugin = {
  load: (id) => (id.endsWith(".sql") ? `export default ${JSON.stringify(readFileSync(id, "utf8"))};` : undefined),
  name: "sql-text",
};

// `cloudflare:workers` exists only in the Workers runtime, so the Worker's imports of it resolve to the package whose
// `env` `createMockDb` fills with the file's Miniflare bindings
const vitestConfig: ViteUserConfig = {
  ...vitestConfiguration,
  plugins: [...(vitestConfiguration.plugins ?? []), sqlTextPlugin],
  resolve: { ...vitestConfiguration.resolve, alias: { "cloudflare:workers": "@esposter/db-mock" } },
};

export default vitestConfig;
