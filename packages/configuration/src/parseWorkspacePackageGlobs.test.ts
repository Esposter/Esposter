import { parseWorkspacePackageGlobs } from "#src/parseWorkspacePackageGlobs";
import { describe, expect, test } from "vitest";

describe(parseWorkspacePackageGlobs, () => {
  const WORKSPACE_YAML = `packages:
  - a
  - b

a:
  - a
`;

  test("reads the globs the packages block declares, in order, and stops at the next section", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML)).toStrictEqual(["a", "b"]);
  });

  test("reads a quoted entry as the glob it quotes", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs('packages:\n  - "a"\n')).toStrictEqual(["a"]);
  });

  test("reads the globs a CRLF file declares", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs(WORKSPACE_YAML.replaceAll("\n", "\r\n"))).toStrictEqual(["a", "b"]);
  });

  test("returns nothing when the file declares no packages block", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs("a:\n  - a\n")).toStrictEqual([]);
  });

  test("keeps the final entry when the file ends without a trailing newline", () => {
    expect.hasAssertions();

    expect(parseWorkspacePackageGlobs("packages:\n  - a\n  - b")).toStrictEqual(["a", "b"]);
  });
});
