import { parseWorkspacePackageGlobs } from "#src/services/parseWorkspacePackageGlobs";
import { describe, expect, test } from "vitest";

describe(parseWorkspacePackageGlobs, () => {
  const WORKSPACE_YAML = `packages:
  - apps/*
  - packages/*
  - scripts

allowBuilds:
  esbuild: true

catalog:
  vitest: ^5.0.0
`;

  test("reads the globs the packages block declares, in order", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML)).toStrictEqual(["apps/*", "packages/*", "scripts"]);
  });

  test("stops at the first section that is not a package entry", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML)).not.toContain("esbuild: true");
  });

  test("reads a quoted entry as the glob it quotes", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs('packages:\n  - "apps/*"\n')).toStrictEqual(["apps/*"]);
  });

  test("reads the globs a CRLF file declares", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML.replaceAll("\n", "\r\n"))).toStrictEqual([
      "apps/*",
      "packages/*",
      "scripts",
    ]);
  });

  test("returns nothing when the file declares no packages block", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs("catalog:\n  vitest: ^5.0.0\n")).toStrictEqual([]);
  });
});
