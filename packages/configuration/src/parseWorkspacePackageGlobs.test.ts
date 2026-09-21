import { parseWorkspacePackageGlobs } from "#src/parseWorkspacePackageGlobs";
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

  test("reads the globs the packages block declares, in order, and stops at the next section", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML)).toStrictEqual(["apps/*", "packages/*", "scripts"]);
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

  test("keeps the final entry when the file ends without a trailing newline", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs("packages:\n  - apps/*\n  - packages/*")).toStrictEqual(["apps/*", "packages/*"]);
  });
});
