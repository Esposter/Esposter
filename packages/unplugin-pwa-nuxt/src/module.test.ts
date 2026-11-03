import type { Nuxt, NuxtPluginTemplate } from "@nuxt/schema";

import pwaModule from "#src/module";
import { addPluginTemplate, addVitePlugin } from "@nuxt/kit";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@nuxt/kit"), async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nuxt/kit")>()),
  addPluginTemplate: vi.fn<typeof import("@nuxt/kit").addPluginTemplate>(),
  // A Mock cannot carry a generic kit function's signature, so the mocks are cast to it
  addTypeTemplate: vi.fn<
    typeof import("@nuxt/kit").addTypeTemplate
  >() as unknown as typeof import("@nuxt/kit").addTypeTemplate,
  addVitePlugin: vi.fn<typeof import("@nuxt/kit").addVitePlugin>(),
}));

const createNuxt = (baseURL = "/"): { hooks: string[]; nuxt: Nuxt } => {
  const hooks: string[] = [];
  const nuxt = {
    _version: "5.0.0",
    callHook: () => Promise.resolve(),
    hook: (name: string) => hooks.push(name),
    options: { app: { baseURL, buildAssetsDir: "/_nuxt/", head: {} }, dev: false },
  } as unknown as Nuxt;
  return { hooks, nuxt };
};

describe(pwaModule, () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("the manifest is linked under the base URL", async () => {
    expect.hasAssertions();

    const { nuxt } = createNuxt("/app/");
    await pwaModule({ manifest: { name: "Fixture" } }, nuxt);

    expect(nuxt.options.app.head).toStrictEqual({ link: [{ href: "/app/manifest.webmanifest", rel: "manifest" }] });
  });

  test("the client plugin is written with the update check's period and registered for the client only", async () => {
    expect.hasAssertions();

    const { nuxt } = createNuxt();
    await pwaModule({ periodicSyncForUpdates: 3600 }, nuxt);
    const [call] = vi.mocked(addPluginTemplate).mock.calls;
    assert.exists(call);
    // The module adds a template, never a path, as its plugin
    const [template] = call as [NuxtPluginTemplate];
    const contents = await template.getContents?.({} as never);

    expect(template.mode).toBe("client");
    expect(contents).toContain("createPwaPlugin(useRegisterSW, 3600)");
    expect(vi.mocked(addVitePlugin)).toHaveBeenCalledTimes(1);
  });

  test("a disabled module adds nothing and waits for nothing", async () => {
    expect.hasAssertions();

    const { hooks, nuxt } = createNuxt();
    await pwaModule({ disable: true }, nuxt);

    expect(vi.mocked(addPluginTemplate)).not.toHaveBeenCalled();
    expect(vi.mocked(addVitePlugin)).not.toHaveBeenCalled();
    expect(hooks).toStrictEqual([]);
  });
});
