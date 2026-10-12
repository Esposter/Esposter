import { isExcludedPath } from "#src/services/review/isExcludedPath";
import { describe, expect, test } from "vitest";

describe(isExcludedPath, () => {
  test("excludes the generated and machine-written paths", () => {
    expect.hasAssertions();

    expect(isExcludedPath("pnpm-lock.yaml")).toBe(true);
    expect(isExcludedPath("apps/web/server/db/migrations/0001.sql")).toBe(true);
    expect(isExcludedPath("packages/db-mock/src/snapshot.tar.gz")).toBe(true);
  });

  test("reads the paths no pattern names", () => {
    expect.hasAssertions();

    expect(isExcludedPath("packages/shared/src/index.ts")).toBe(false);
    expect(isExcludedPath("packages/shared/src/index.test.ts.bak")).toBe(false);
  });
});
