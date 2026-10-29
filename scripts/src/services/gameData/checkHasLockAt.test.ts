import { checkHasLockAt } from "#src/services/gameData/checkHasLockAt";
import { describe, expect, test } from "vitest";

describe(checkHasLockAt, () => {
  test("finds the lock at HEAD, the revision the working tree is checked out at", () => {
    expect.hasAssertions();

    expect(checkHasLockAt("HEAD")).toBe(true);
  });

  // A commit missing from a shallow clone reads as a git error, which must not read as no lock beside a stored blob
  test("throws for a revision git cannot read, rather than reporting no lock there", () => {
    expect.hasAssertions();

    expect(() => checkHasLockAt("f".repeat(40))).toThrowErrorMatchingInlineSnapshot(`
      [Error: Command failed: git cat-file -e ffffffffffffffffffffffffffffffffffffffff^{commit}
      fatal: Not a valid object name ffffffffffffffffffffffffffffffffffffffff^{commit}
      ]
    `);
  });
});
