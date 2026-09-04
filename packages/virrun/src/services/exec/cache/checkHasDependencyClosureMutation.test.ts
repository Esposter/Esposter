import type { FlushOp } from "#src/models/exec/FlushOp";

import { FlushOpType } from "#src/models/exec/FlushOp";
import { checkHasDependencyClosureMutation } from "#src/services/exec/cache/checkHasDependencyClosureMutation";
import { PNPM_LOCKFILE_FILENAME } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(checkHasDependencyClosureMutation, () => {
  const sourceEdit: FlushOp = { relativePath: TEST_FILENAME, type: FlushOpType.Copy };

  test("flags a plan that rewrites the root lockfile", () => {
    expect.hasAssertions();

    const plan: FlushOp[] = [sourceEdit, { relativePath: PNPM_LOCKFILE_FILENAME, type: FlushOpType.Copy }];

    expect(checkHasDependencyClosureMutation(plan)).toBe(true);
  });

  test("flags a nested workspace lockfile at any depth", () => {
    expect.hasAssertions();

    const plan: FlushOp[] = [{ relativePath: `packages/app/${PNPM_LOCKFILE_FILENAME}`, type: FlushOpType.Copy }];

    expect(checkHasDependencyClosureMutation(plan)).toBe(true);
  });

  test("does not flag a pure source-tree diff", () => {
    expect.hasAssertions();

    expect(checkHasDependencyClosureMutation([sourceEdit])).toBe(false);
  });

  test("does not flag a path that merely contains the lockfile name as a substring", () => {
    expect.hasAssertions();

    const plan: FlushOp[] = [{ relativePath: `${PNPM_LOCKFILE_FILENAME}.bak`, type: FlushOpType.Copy }];

    expect(checkHasDependencyClosureMutation(plan)).toBe(false);
  });

  test("does not flag an empty plan", () => {
    expect.hasAssertions();

    expect(checkHasDependencyClosureMutation([])).toBe(false);
  });
});
