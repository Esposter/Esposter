import type { NuxtHooks } from "nuxt/schema";
import type { VitestPluginContext } from "vitest/node";

import { createAutoImportCacheKey } from "#configuration/createAutoImportCacheKey";
import { describe, expect, test } from "vitest";

type CacheKeyGenerator = Parameters<VitestPluginContext["defineCacheKeyGenerator"]>[0];
type Unimport = Parameters<NuxtHooks["imports:context"]>[0];

const getGenerator = async (imports: { from: string; name: string }[]) => {
  const { hooks, plugin } = createAutoImportCacheKey();
  let generator: CacheKeyGenerator | undefined;
  hooks["imports:context"]({ getImports: () => Promise.resolve(imports) } as unknown as Unimport);
  hooks["components:extend"]([]);
  await plugin.configureVitest({
    defineCacheKeyGenerator: (newGenerator: CacheKeyGenerator) => {
      generator = newGenerator;
    },
  } as unknown as VitestPluginContext);
  return (code: string) => generator?.({ id: "", sourceCode: code } as Parameters<CacheKeyGenerator>[0]);
};

describe(createAutoImportCacheKey, () => {
  const name = "useName";
  const from = "/composables/from.ts";
  const sourceCode = `${name}();`;

  test("an export moved to another file re-keys the module that names it", async () => {
    expect.hasAssertions();

    const before = await getGenerator([{ from, name }]);
    const after = await getGenerator([{ from: "/composables/to.ts", name }]);

    expect(after(sourceCode)).not.toBe(before(sourceCode));
  });

  test("an auto-import the module does not name leaves its key alone", async () => {
    expect.hasAssertions();

    const before = await getGenerator([{ from, name }]);
    const after = await getGenerator([
      { from, name },
      { from, name: "useOther" },
    ]);

    expect(after(sourceCode)).toBe(before(sourceCode));
  });

  test("refuses to run when Nuxt never handed over its auto-import context", async () => {
    expect.hasAssertions();

    const { plugin } = createAutoImportCacheKey();

    await expect(plugin.configureVitest({} as VitestPluginContext)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Nuxt never handed over its auto-import context, so a persisted transform could not be keyed on it]`,
    );
  });
});
