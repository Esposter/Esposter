import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { checkHasGraphInput } from "#src/services/precheck/checkHasGraphInput";
import { describe, expect, test } from "vitest";

describe(checkHasGraphInput, () => {
  test.each([
    "package.json",
    "packages/shared/package.json",
    "pnpm-workspace.yaml",
    "scripts/src/services/dependencyGraph/getGraphSvg.ts",
  ])("%s moves the graph", (path) => {
    expect.hasAssertions();

    expect(checkHasGraphInput([{ path, status: ChangeStatus.Modified }])).toBe(true);
  });

  // The lockfile follows a manifest that is already a trigger, and a name that only ends in `package.json` is not a manifest
  test.each(["packages/shared/src/index.ts", "pnpm-lock.yaml", "packages/shared/not-package.json"])(
    "%s leaves it",
    (path) => {
      expect.hasAssertions();

      expect(checkHasGraphInput([{ path, status: ChangeStatus.Modified }])).toBe(false);
    },
  );

  test("counts a deleted manifest", () => {
    expect.hasAssertions();

    expect(checkHasGraphInput([{ path: "packages/shared/package.json", status: ChangeStatus.Deleted }])).toBe(true);
  });
});
