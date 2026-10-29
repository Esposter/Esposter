import { terrainWorkerAlias } from "#parity/terrainWorkerAlias";
import { takeOne } from "@esposter/shared";
import { resolve } from "node:path";
import { createServer } from "vite";
import { describe, expect, test } from "vitest";

describe("the parity page's vite config", () => {
  // The World fixture's terrain worker import must resolve to the worker's source under the parity config, or the page fails
  // to load every fixture: the import carries Vite's `?worker` query, which only the alias resolves
  test("resolves the World fixture's terrain worker import to the worker's source", async () => {
    expect.hasAssertions();

    const server = await createServer({
      appType: "custom",
      configFile: resolve(import.meta.dirname, "vite.config.ts"),
      logLevel: "silent",
      optimizeDeps: { noDiscovery: true },
      server: { hmr: false, middlewareMode: true },
    });
    try {
      const resolved = await server.pluginContainer.resolveId(
        takeOne(Object.keys(terrainWorkerAlias), 0),
        resolve(import.meta.dirname, "../src/components/World/Screen/Index.fixture.ts"),
      );
      expect(resolved?.id).toBe(takeOne(Object.values(terrainWorkerAlias), 0));
    } finally {
      await server.close();
    }
  });
});
