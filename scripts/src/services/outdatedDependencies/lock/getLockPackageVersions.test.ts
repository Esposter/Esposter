import { getLockPackageVersions } from "#src/services/outdatedDependencies/lock/getLockPackageVersions";
import { describe, expect, test } from "vitest";

describe(getLockPackageVersions, () => {
  const lockYaml = [
    "lockfileVersion: '9.0'",
    "",
    "packages:",
    "",
    "  manager@1.0.0:",
    "    resolution: {integrity: sha512-z}",
    "",
    "---",
    "lockfileVersion: '9.0'",
    "",
    "packages:",
    "",
    "  '@scope/single@1.0.1':",
    "    resolution: {integrity: sha512-a}",
    "",
    "  plain@2.0.0(peer@1.0.0):",
    "    resolution: {integrity: sha512-b}",
    "",
    "  twice@1.0.0:",
    "    resolution: {integrity: sha512-c}",
    "",
    "  twice@2.0.0:",
    "    resolution: {integrity: sha512-d}",
    "",
    "snapshots:",
    "",
    "  '@scope/single@9.9.9': {}",
  ].join("\n");

  test("reads the tree's one version of a package, and leaves out a package at several", () => {
    expect.hasAssertions();

    expect(getLockPackageVersions(lockYaml)).toStrictEqual(
      new Map([
        ["@scope/single", "1.0.1"],
        ["plain", "2.0.0"],
      ]),
    );
  });
});
