import { checkIsExcludedPath } from "#src/services/review/checkIsExcludedPath";
import { describe, expect, test } from "vitest";

describe(checkIsExcludedPath, () => {
  test("excludes the generated and machine-written paths", () => {
    expect.hasAssertions();

    expect(checkIsExcludedPath("pnpm-lock.yaml")).toBe(true);
    expect(checkIsExcludedPath("apps/web/server/db/migrations/0001.sql")).toBe(true);
    expect(checkIsExcludedPath("packages/db-mock/src/snapshot.tar.gz")).toBe(true);
  });

  test("reads the paths no pattern names", () => {
    expect.hasAssertions();

    expect(checkIsExcludedPath("packages/shared/src/index.ts")).toBe(false);
    expect(checkIsExcludedPath("packages/shared/src/index.test.ts.bak")).toBe(false);
  });
});
