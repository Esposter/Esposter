import { checkIsExternalFile } from "#src/services/citations/checkIsExternalFile";
import { describe, expect, test } from "vitest";

describe(checkIsExternalFile, () => {
  const PAGE_PATH = "openspec/specs/genshin/combat/design.md";
  const REPOSITORY_PATHS = new Set([
    "apps/web/server/db/migrations/20240107052255_dusty_proteus/migration.sql",
    "packages/vue-phaserjs/src/index.ts",
    "renovate.json",
    "scripts/src/services/genshinAssets/kits/gcsim/fixtures/noelle/burst.go",
  ]);

  test("treats a package's build output as external, not a repository file", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("packages/vue-phaserjs/dist/index.js", PAGE_PATH, REPOSITORY_PATHS)).toBe(true);
  });

  test("treats a repository-root build output as external", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("dist/index.js", PAGE_PATH, REPOSITORY_PATHS)).toBe(true);
  });

  test("keeps a tracked source file a repository file", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("packages/vue-phaserjs/src/index.ts", PAGE_PATH, REPOSITORY_PATHS)).toBe(false);
  });

  test("keeps a tracked root-level json file a repository file", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("renovate.json", PAGE_PATH, REPOSITORY_PATHS)).toBe(false);
  });

  test("keeps a tracked sql migration cited by its path a repository file", () => {
    expect.hasAssertions();

    expect(
      checkIsExternalFile(
        "apps/web/server/db/migrations/20240107052255_dusty_proteus/migration.sql",
        PAGE_PATH,
        REPOSITORY_PATHS,
      ),
    ).toBe(false);
  });

  test("keeps a tracked gcsim fixture cited by its path a repository file", () => {
    expect.hasAssertions();

    expect(
      checkIsExternalFile(
        "scripts/src/services/genshinAssets/kits/gcsim/fixtures/noelle/burst.go",
        PAGE_PATH,
        REPOSITORY_PATHS,
      ),
    ).toBe(false);
  });

  test("treats an untracked bare game-data json name as external", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("Category_Lisa_Talents.json", PAGE_PATH, REPOSITORY_PATHS)).toBe(true);
  });

  test("treats an untracked bare gcsim go name as external", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("burst.go", PAGE_PATH, REPOSITORY_PATHS)).toBe(true);
  });
});
