import { parseLockResolvedVersions } from "@/checkDependencies/parseLockResolvedVersions";
import { describe, expect, test } from "vitest";

describe(parseLockResolvedVersions, () => {
  test("maps each package to its resolved version at the given indent", () => {
    expect.hasAssertions();

    expect(parseLockResolvedVersions("    a:\n      specifier: ^0.0.0\n      version: 0.0.0\n", 4)).toStrictEqual(
      new Map([["a", "0.0.0"]]),
    );
  });

  test("strips peer/build metadata from the resolved version", () => {
    expect.hasAssertions();

    expect(parseLockResolvedVersions("    a:\n      specifier: ^0.0.0\n      version: 0.0.0(b)\n", 4)).toStrictEqual(
      new Map([["a", "0.0.0"]]),
    );
  });
});
