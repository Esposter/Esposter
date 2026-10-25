import type { Nuxt } from "@nuxt/schema";
import type { Nitro } from "nitro/types";

import securityModule from "#src/module";
import { MODULE_NAME } from "#src/runtime/constants";
import { addServerTemplate } from "@nuxt/kit";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("@nuxt/kit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nuxt/kit")>()),
  addNitroPlugin: vi.fn(),
  addServerHandler: vi.fn(),
  addServerTemplate: vi.fn(),
  addTypeTemplate: vi.fn(),
}));

describe(securityModule, () => {
  const SRI_HASHES_FILENAME = `#${MODULE_NAME}/sri-hashes.mjs`;
  const SCRIPT_HASH = "sha384-62uBgnG6+YTGQNMl+obi6qVkdGZnlhGcgfthFhDiF516gWydfNbHtTpyulxi7Aeh";
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "nuxt-security-module-"));
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await rm(directory, { force: true, recursive: true });
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
    await mkdir(join(directory, "_nuxt"), { recursive: true });
    await writeFile(join(directory, "_nuxt", "entry.js"), "entry");
    const publicAssetsHook = hooks.get("nitro:build:public-assets");
    assert.exists(publicAssetsHook);
    await publicAssetsHook({
      options: { output: { publicDir: directory }, runtimeConfig: { app: { baseURL: "/", cdnURL: "" } } },
    } as unknown as Nitro);

    const sriHashesTemplate = vi
      .mocked(addServerTemplate)
      .mock.calls.map(([template]) => template)
      .find((template) => template.filename === SRI_HASHES_FILENAME);
    assert.exists(sriHashesTemplate);
    const contents = await sriHashesTemplate.getContents();

    expect(contents).toStrictEqual(`export default ${JSON.stringify({ "/_nuxt/entry.js": SCRIPT_HASH })}\n`);
  });
});
