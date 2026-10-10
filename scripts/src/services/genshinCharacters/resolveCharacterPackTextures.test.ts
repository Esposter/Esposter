import { resolveCharacterPackTextures } from "#src/services/genshinCharacters/resolveCharacterPackTextures";
import { describe, expect, test } from "vitest";

describe(resolveCharacterPackTextures, () => {
  test("matches a texture to its file in any case and either Unicode form, stored under the model's spelling", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures([String.raw`A\B`, "é"], ["a/b", "é"])).toStrictEqual({
      files: [
        { filePath: "a/b", path: "A/B" },
        { filePath: "é", path: "é" },
      ],
      missingPaths: [],
    });
  });

  test("reports a texture no file matches and one climbing out of the model's folder", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures(["a", "../b"], ["b"])).toStrictEqual({
      files: [],
      missingPaths: ["a", "../b"],
    });
  });
});
