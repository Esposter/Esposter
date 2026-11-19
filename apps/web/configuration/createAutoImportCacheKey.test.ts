import type { VitestPluginContext } from "vitest/node";

import { createAutoImportCacheKey } from "#configuration/createAutoImportCacheKey";
import { describe, expect, test } from "vitest";

type CacheKeyGenerator = Parameters<VitestPluginContext["defineCacheKeyGenerator"]>[0];

const getGenerator = (imports: { from: string; name: string }[]) => {
  const { hooks, plugin } = createAutoImportCacheKey();
  let generator: CacheKeyGenerator | undefined;
  hooks["imports:extend"](imports);
  hooks["components:extend"]([]);
  plugin.configureVitest({
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

  test("an export moved to another file re-keys the module that names it", () => {
    expect.hasAssertions();

    const before = getGenerator([{ from, name }]);
    const after = getGenerator([{ from: "/composables/to.ts", name }]);

    expect(after(sourceCode)).not.toBe(before(sourceCode));
  });

  test("an auto-import the module does not name leaves its key alone", () => {
    expect.hasAssertions();

    const before = getGenerator([{ from, name }]);
    const after = getGenerator([
      { from, name },
      { from, name: "useOther" },
    ]);

    expect(after(sourceCode)).toBe(before(sourceCode));
  });

  test("refuses to run when Nuxt never handed over its auto-imports", () => {
    expect.hasAssertions();

    const { plugin } = createAutoImportCacheKey();

    expect(() => {
      plugin.configureVitest({} as VitestPluginContext);
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Nuxt never handed over its auto-imports, so a persisted transform could not be keyed on it]`,
    );
  });
});
