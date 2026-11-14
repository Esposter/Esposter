import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname);

// `cloudflare:workers` exists only in the Workers runtime, so the Worker's imports of it resolve to the package whose
// `env` `createMockDb` fills with the file's Miniflare bindings
export default {
  ...vitestConfiguration,
  resolve: { ...vitestConfiguration.resolve, alias: { "cloudflare:workers": "@esposter/db-mock" } },
} satisfies ViteUserConfig;
