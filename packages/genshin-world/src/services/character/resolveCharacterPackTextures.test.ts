import { resolveCharacterPackTextures } from "#src/services/character/resolveCharacterPackTextures";
import { describe, expect, test } from "vitest";

describe(resolveCharacterPackTextures, () => {
  test("matches a texture to its file in any case and either Unicode form, found under the model's spelling", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures([String.raw`A\B`, "é"], ["a/b", "é"], "")).toStrictEqual({
      files: [
        { filePath: "a/b", path: "A/B" },
        { filePath: "é", path: "é" },
      ],
    });
  });

  test("matches a texture whose path leaves a folder and comes back within the model's folder", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures([String.raw`a\..\b`], ["b"], "")).toStrictEqual({
      files: [{ filePath: "b", path: "b" }],
    });
  });

  test("leaves out a texture no file matches and one climbing out of the model's folder", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures(["a", "../b", "a/../../b"], ["b"], "")).toStrictEqual({ files: [] });
  });

  test("matches a texture below the model's own folder, kept at its path in the release", () => {
    expect.hasAssertions();
    expect(resolveCharacterPackTextures(["a", "b"], ["a", "c/a", "b"], "c/d.pmx")).toStrictEqual({
      files: [{ filePath: "c/a", path: "a" }],
    });
  });
});
