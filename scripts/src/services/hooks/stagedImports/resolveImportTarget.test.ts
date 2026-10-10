import { resolveImportTarget } from "#src/services/hooks/stagedImports/resolveImportTarget";
import { describe, expect, test } from "vitest";

describe(resolveImportTarget, () => {
  const ALIASES = { "#src/*": "./src/*.ts" };
  const PACKAGE_DIRECTORY = "packages/genshin-world";

  test("maps a package alias through its imports pattern", () => {
    expect.hasAssertions();

    expect(
      resolveImportTarget(
        "#src/services/quest/checkIsQuestFinished",
        "packages/genshin-world/src/a.ts",
        PACKAGE_DIRECTORY,
        ALIASES,
      ),
    ).toStrictEqual({
      candidates: [
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts.ts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts.mts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts.vue",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts.json",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts.d.ts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts/index.ts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts/index.mts",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts/index.vue",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts/index.json",
        "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts/index.d.ts",
      ],
      path: "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts",
    });
  });

  test("takes the most specific pattern when several match, as Node does", () => {
    expect.hasAssertions();

    const aliases = { "#src/*": "./src/*.ts", "#src/*.vue": "./src/*.vue" };

    expect(
      resolveImportTarget(
        "#src/components/World/Character/Index.vue",
        "packages/genshin-world/src/a.ts",
        PACKAGE_DIRECTORY,
        aliases,
      )?.path,
    ).toBe("packages/genshin-world/src/components/World/Character/Index.vue");
  });

  test("resolves a relative path against the importing file's directory", () => {
    expect.hasAssertions();

    expect(
      resolveImportTarget("./Panel", "packages/genshin-world/src/components/Index.vue", PACKAGE_DIRECTORY, {}),
    ).toStrictEqual({
      candidates: [
        "packages/genshin-world/src/components/Panel",
        "packages/genshin-world/src/components/Panel.ts",
        "packages/genshin-world/src/components/Panel.mts",
        "packages/genshin-world/src/components/Panel.vue",
        "packages/genshin-world/src/components/Panel.json",
        "packages/genshin-world/src/components/Panel.d.ts",
        "packages/genshin-world/src/components/Panel/index.ts",
        "packages/genshin-world/src/components/Panel/index.mts",
        "packages/genshin-world/src/components/Panel/index.vue",
        "packages/genshin-world/src/components/Panel/index.json",
        "packages/genshin-world/src/components/Panel/index.d.ts",
      ],
      path: "packages/genshin-world/src/components/Panel",
    });
  });

  test("returns nothing for a bare package or a path that leaves the repository", () => {
    expect.hasAssertions();

    expect(resolveImportTarget("vue", "packages/genshin-world/src/a.ts", PACKAGE_DIRECTORY, ALIASES)).toBeUndefined();
    expect(resolveImportTarget("../../../x", "a.ts", PACKAGE_DIRECTORY, ALIASES)).toBeUndefined();
  });
});
