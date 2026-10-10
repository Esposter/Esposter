import { chooseCharacterPackModel } from "#src/services/character/chooseCharacterPackModel";
import { describe, expect, test, vi } from "vitest";

describe(chooseCharacterPackModel, () => {
  test("takes a folder's one model in any case without reading a name", async () => {
    expect.hasAssertions();

    const readModelName = vi.fn<(filePath: string) => Promise<string>>();
    const readCharacterNames = vi.fn<() => Promise<readonly string[]>>();

    await expect(chooseCharacterPackModel("", ["", "a.PMX"], readModelName, readCharacterNames)).resolves.toBe("a.PMX");
    expect(readModelName).not.toHaveBeenCalled();
    expect(readCharacterNames).not.toHaveBeenCalled();
  });

  // The official packs name a model in Chinese or English, spelt in a case of their own
  test("takes the one model of several named as its character, in any case", async () => {
    expect.hasAssertions();
    await expect(
      chooseCharacterPackModel(
        "",
        ["a.pmx", "b.pmx"],
        (filePath) => Promise.resolve(filePath === "a.pmx" ? "" : "A"),
        () => Promise.resolve(["a"]),
      ),
    ).resolves.toBe("b.pmx");
  });

  test("refuses a folder of several models none of which is named as its character, naming each", async () => {
    expect.hasAssertions();
    await expect(
      chooseCharacterPackModel(
        "",
        ["a.pmx", "b.pmx"],
        () => Promise.resolve(""),
        () => Promise.resolve(["a"]),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , holds several .pmx models, 0 named as its character: a.pmx, b.pmx]`,
    );
  });
});
