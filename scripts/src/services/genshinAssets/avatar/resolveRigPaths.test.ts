import { resolveRigPaths } from "#src/services/genshinAssets/avatar/resolveRigPaths";
import { crc32 } from "node:zlib";
import { describe, expect, test } from "vitest";

describe("resolveRigPaths", () => {
  test("resolves each bone's path under its parent's from the last name's CRC32", () => {
    expect.hasAssertions();

    const paths = resolveRigPaths([-1, 0, 1], [crc32(""), crc32("a"), crc32("b")], ["", "a", "a/b", "a/c"]);

    expect(paths).toStrictEqual(["", "a", "a/b"]);
  });

  test("throws when a bone's name matches no path under its parent", () => {
    expect.hasAssertions();

    expect(() => resolveRigPaths([-1, 0], [crc32(""), crc32("missing")], ["", "a"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: bone 1 of the root, matches 0 paths of the rig's table, not one]`,
    );
  });
});
