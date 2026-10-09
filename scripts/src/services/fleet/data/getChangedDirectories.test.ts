import { getChangedDirectories } from "#src/services/fleet/data/getChangedDirectories";
import { describe, expect, test } from "vitest";

describe(getChangedDirectories, () => {
  test("returns the source's directories the target lacks or holds with another digest", () => {
    expect.hasAssertions();

    expect(getChangedDirectories({ a: "1", b: "2", c: "3" }, { a: "1", b: "9" })).toStrictEqual(["b", "c"]);
  });

  test("returns nothing when the digests match", () => {
    expect.hasAssertions();

    expect(getChangedDirectories({ a: "1" }, { a: "1" })).toStrictEqual([]);
  });
});
