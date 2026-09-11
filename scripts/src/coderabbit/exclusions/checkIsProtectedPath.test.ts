import { checkIsProtectedPath } from "#src/coderabbit/exclusions/checkIsProtectedPath";
import { describe, expect, test } from "vitest";

describe(checkIsProtectedPath, () => {
  test.each([
    "apps/web/app/store/alert.test.ts",
    "packages/shared/src/types.test-d.ts",
    "apps/web/content/docs/architecture/no-polling.md",
    ".agents/skills/coderabbit/SKILL.md",
    ".coderabbit.yaml",
    ".github/workflows/ci.yml",
    "packages/shared/package.json",
    "apps/web/vitest.config.ts",
    "packages/shared/eslint.config.js",
    "apps/web/postcss.config.mjs",
    "packages/db-schema/src/schema/message.ts",
    "apps/web/server/db/migrations/0001_init.sql",
  ])("keeps %s in review", (path) => {
    expect.hasAssertions();

    expect(checkIsProtectedPath(path)).toBe(true);
  });

  test.each([
    "apps/web/app/store/alert.ts",
    "packages/shared/src/util/sleep.ts",
    "scripts/src/coderabbit/window/index.ts",
  ])("lets %s be classified", (path) => {
    expect.hasAssertions();

    expect(checkIsProtectedPath(path)).toBe(false);
  });
});
