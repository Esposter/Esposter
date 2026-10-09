import { getDirectoryDigest } from "#src/services/fleet/data/getDirectoryDigest";
import { describe, expect, test } from "vitest";

const FILE = { mtime: 1, name: "a.png", size: 2 };
const CHILD = { digest: "b", name: "sub" };

describe(getDirectoryDigest, () => {
  test("does not depend on the order the files and directories are listed in", () => {
    expect.hasAssertions();

    const other = { mtime: 1, name: "b.png", size: 2 };
    expect(getDirectoryDigest([FILE, other], [CHILD])).toBe(getDirectoryDigest([other, FILE], [CHILD]));
  });

  test("changes when a file's size or mtime changes", () => {
    expect.hasAssertions();

    const digest = getDirectoryDigest([FILE], []);
    expect(getDirectoryDigest([{ ...FILE, size: 3 }], [])).not.toBe(digest);
    expect(getDirectoryDigest([{ ...FILE, mtime: 2 }], [])).not.toBe(digest);
  });

  test("changes when a child directory's digest changes", () => {
    expect.hasAssertions();

    expect(getDirectoryDigest([], [{ ...CHILD, digest: "c" }])).not.toBe(getDirectoryDigest([], [CHILD]));
  });
});
