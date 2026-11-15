import type { Nuxt, ViteConfig } from "nuxt/schema";

import { viteHooks } from "@@/configuration/vite";
import { assert, describe, expect, test, vi } from "vitest";

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
