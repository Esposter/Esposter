import type { Nuxt } from "@nuxt/schema";
import type { Nitro } from "nitro/types";

import { SRI_HASHES_TEMPLATE_FILENAME } from "#src/constants";
import { SCRIPT_HASH } from "#src/constants.test";
import securityModule from "#src/module";
import { setupTemporaryDirectory } from "#src/setupTemporaryDirectory.test";
import { addServerTemplate } from "@nuxt/kit";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock("@nuxt/kit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nuxt/kit")>()),
  addNitroPlugin: vi.fn<typeof import("@nuxt/kit").addNitroPlugin>(),
  addServerHandler: vi.fn<typeof import("@nuxt/kit").addServerHandler>(),
  addServerTemplate: vi.fn<typeof import("@nuxt/kit").addServerTemplate>(),
  addTypeTemplate: vi.fn<typeof import("@nuxt/kit").addTypeTemplate>(),
}));

describe(securityModule, () => {
  const getDirectory = setupTemporaryDirectory();

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("the client bundles the build writes are hashed once Nitro has copied its public assets, into the template the plugin reads", async () => {
    expect.hasAssertions();

    const hooks = new Map<string, (nitro: Nitro) => Promise<void>>();
    const nuxt = {
      _version: "5.0.0",
      callHook: () => Promise.resolve(),
      hook: (name: string, hook: (nitro: Nitro) => Promise<void>) => hooks.set(name, hook),
      options: { dev: false, devServer: { url: "http://localhost:3000" }, routeRules: {}, runtimeConfig: {}, vite: {} },
    } as unknown as Nuxt;
    await securityModule({}, nuxt);

    // The module is set up before the build writes its client bundles, so the bundles are written after setup
    await mkdir(join(getDirectory(), "_nuxt"), { recursive: true });
    await writeFile(join(getDirectory(), "_nuxt", "entry.js"), "entry");
    const publicAssetsHook = hooks.get("nitro:build:public-assets");
    assert.exists(publicAssetsHook);
    await publicAssetsHook({
      options: { output: { publicDir: getDirectory() }, runtimeConfig: { app: { baseURL: "/", cdnURL: "" } } },
    } as unknown as Nitro);

    const sriHashesTemplate = vi
      .mocked(addServerTemplate)
      .mock.calls.map(([template]) => template)
      .find((template) => template.filename === SRI_HASHES_TEMPLATE_FILENAME);
    assert.exists(sriHashesTemplate);
    const contents = await sriHashesTemplate.getContents();

    expect(contents).toStrictEqual(`export default ${JSON.stringify({ "/_nuxt/entry.js": SCRIPT_HASH })}\n`);
  });
});
