import type { Nuxt, ViteConfig } from "nuxt/schema";

import { vite, viteHooks } from "#configuration/vite";
import { assert, describe, expect, test, vi } from "vitest";

describe("vite", () => {
  test.each([
    ["fails the build on", "INEFFECTIVE_DYNAMIC_IMPORT", "error"],
    ["passes through", "CIRCULAR_DEPENDENCY", "warn"],
  ] as const)("%s %s", (_name, code, expectedLevel) => {
    expect.hasAssertions();

    const onLog = vite.build?.rolldownOptions?.onLog;
    assert.exists(onLog);
    const handler = vi.fn<Parameters<typeof onLog>[2]>();
    const log = { code, message: "" };
    onLog("warn", log, handler);

    expect(handler).toHaveBeenCalledExactlyOnceWith(expectedLevel, log);
  });

  test.each([
    ["a call background's svg", "assets/message/room/call/backgrounds/aurora.svg", false],
    ["an app's svg", "assets/icons/anime.svg", undefined],
  ])("resolves the inline decision for %s to %s", (_name, path, expected) => {
    expect.hasAssertions();

    const assetsInlineLimit = vite.build?.assetsInlineLimit;
    assert(typeof assetsInlineLimit === "function");

    expect(assetsInlineLimit(path, Buffer.from(""))).toBe(expected);
  });
});

describe("viteHooks", () => {
  const filename = "_nuxt/Cursor.DfOkTuEE.png";
  // The URL Nuxt's own resolver gives, so a test sees whether the hook answered or handed the asset back to Nuxt
  const nuxtUrl = { relative: true };
  const extendConfig = async () => {
    const renderBuiltUrl = vi.fn<NonNullable<NonNullable<ViteConfig["experimental"]>["renderBuiltUrl"]>>(() => nuxtUrl);
    const config: ViteConfig = { experimental: { renderBuiltUrl } };
    const extend = viteHooks?.["vite:extend"];
    assert.exists(extend);
    await extend({ config, entry: "", nuxt: { options: { app: { buildAssetsDir: "/_nuxt/" } } } as Nuxt } as Parameters<
      typeof extend
    >[0]);
    const extendedRenderBuiltUrl = config.experimental?.renderBuiltUrl;
    assert.exists(extendedRenderBuiltUrl);
    return extendedRenderBuiltUrl;
  };

  // A client chunk's imported asset resolved against the chunk is an absolute URL where the server render writes it
  // Root-relative, so every server-rendered image of one hydrated as a mismatch
  test("resolves a client chunk's imported asset through the build assets helper, as the server does", async () => {
    expect.hasAssertions();

    expect((await extendConfig())(filename, { hostId: "", hostType: "js", ssr: false, type: "asset" })).toStrictEqual({
      runtime: 'globalThis.__buildAssetsURL("Cursor.DfOkTuEE.png")',
    });
  });

  test.each([
    ["the server's asset", { hostId: "", hostType: "js", ssr: true, type: "asset" }],
    ["a stylesheet's asset", { hostId: "", hostType: "css", ssr: false, type: "asset" }],
    ["a public file", { hostId: "", hostType: "js", ssr: false, type: "public" }],
  ] as const)("leaves %s to Nuxt", async (_name, context) => {
    expect.hasAssertions();

    expect((await extendConfig())(filename, context)).toBe(nuxtUrl);
  });
});

// Nuxt names each bundled file under its build folder, from the chunk's name and a content hash
const nuxtAssetFileNames = (asset: { names: string[] }) => `_nuxt/${asset.names[0]}.[hash].[ext]`;

describe("viteHooks assetFileNames", () => {
  test.each([
    [
      "a dungeon's asset",
      "aquavalor",
      "assets/dungeons/UI/monsters/aquavalor.png",
      "_nuxt/engine/aquavalor.[hash].[ext]",
    ],
    [
      "a visual scene's texture",
      "roughness",
      "assets/visual/textures/roughness.jpeg",
      "_nuxt/engine/roughness.[hash].[ext]",
    ],
    ["an app asset", "anime", "assets/icons/anime.svg", "_nuxt/anime.[hash].[ext]"],
  ])(
    "names %s under the build folder, with an engine's under the engine folder",
    async (_name, chunkName, path, expected) => {
      expect.hasAssertions();

      const config: ViteConfig = { build: { rolldownOptions: { output: { assetFileNames: nuxtAssetFileNames } } } };
      const extend = viteHooks?.["vite:extend"];
      assert.exists(extend);
      await extend({
        config,
        entry: "",
        nuxt: { options: { app: { buildAssetsDir: "/_nuxt/" } } } as Nuxt,
      } as Parameters<typeof extend>[0]);
      const output = config.build?.rolldownOptions?.output;
      assert.exists(output);
      assert(!Array.isArray(output));
      const { assetFileNames } = output;
      assert(typeof assetFileNames === "function");

      expect(assetFileNames({ names: [chunkName], originalFileNames: [path], source: "", type: "asset" })).toBe(
        expected,
      );
    },
  );
});
