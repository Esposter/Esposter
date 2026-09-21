import { getNpmLockResolvedVersions } from "#src/services/outdatedDependencies/npm/getNpmLockResolvedVersions";
import { describe, expect, test } from "vitest";

describe(getNpmLockResolvedVersions, () => {
  test("maps each direct dependency to the version installed under node_modules", () => {
    expect.hasAssertions();

    expect(
      getNpmLockResolvedVersions({
        packages: {
          "": {},
          "node_modules/@scope/a": { version: "0.0.0" },
          "node_modules/@scope/a/node_modules/b": { version: "0.0.1" },
          "node_modules/c": {},
        },
      }),
    ).toStrictEqual(new Map([["@scope/a", "0.0.0"]]));
  });

  test("throws on a lockfile without a packages field", () => {
    expect.hasAssertions();

    expect(() => getNpmLockResolvedVersions({})).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: package-lock.json, no packages field]`,
    );
  });
});
