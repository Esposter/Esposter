import { chooseCharacterTermsFile } from "#src/services/genshinCharacters/chooseCharacterTermsFile";
import { describe, expect, test } from "vitest";

describe(chooseCharacterTermsFile, () => {
  test.each([
    { expected: "利用規約.txt", filePaths: ["README.TXT", "利用規約.txt"] },
    { expected: "readme.txt", filePaths: ["a/readme.txt", "readme.txt"] },
  ])("chooses $expected from $filePaths", ({ expected, filePaths }) => {
    expect.hasAssertions();
    expect(chooseCharacterTermsFile("", filePaths)).toBe(expected);
  });

  test("refuses a folder holding no text file named as terms are", () => {
    expect.hasAssertions();
    expect(() => chooseCharacterTermsFile("", ["readme.md"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , holds no terms file, a .txt named 利用規約, readme, 使用说明, 规约, terms]`,
    );
  });
});
