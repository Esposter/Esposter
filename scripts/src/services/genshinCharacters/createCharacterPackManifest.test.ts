import { createCharacterPackManifest } from "#src/services/genshinCharacters/createCharacterPackManifest";
import { describe, expect, test } from "vitest";

describe(createCharacterPackManifest, () => {
  // The record's JSON is what the pack's hash is taken over, so its order is asserted through the JSON
  test("lists each file's hash by its path in path order, whatever order the files came in", () => {
    expect.hasAssertions();
    expect(
      JSON.stringify(
        createCharacterPackManifest([
          { hash: "a", path: "b" },
          { hash: "b", path: "a" },
        ]),
      ),
    ).toBe(JSON.stringify({ files: { a: "b", b: "a" } }));
  });
});
