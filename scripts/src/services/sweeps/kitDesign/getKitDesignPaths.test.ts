import { getKitDesignPaths, KIT_DESIGNS_DIRECTORY } from "#src/services/sweeps/kitDesign/getKitDesignPaths";
import { describe, expect, test } from "vitest";

const withFolders =
  (...folders: string[]) =>
  (path: string) =>
    folders.some((folder) => path === `${KIT_DESIGNS_DIRECTORY}/${folder}/design.md`);

describe(getKitDesignPaths, () => {
  test("resolves a kit to its own folder", () => {
    expect.hasAssertions();

    expect(getKitDesignPaths("alpha", withFolders("alpha"))).toStrictEqual([
      `${KIT_DESIGNS_DIRECTORY}/alpha/design.md`,
    ]);
  });

  // The trap: a kit named differently has no folder of its own, and the word its folder bears is the design
  test("resolves a kit named differently to the one word of its name a folder bears", () => {
    expect.hasAssertions();

    expect(getKitDesignPaths("alpha-beta", withFolders("beta"))).toStrictEqual([
      `${KIT_DESIGNS_DIRECTORY}/beta/design.md`,
    ]);
  });

  test("prefers the kit's own folder to a folder bearing one of its words", () => {
    expect.hasAssertions();

    expect(getKitDesignPaths("alpha-beta", withFolders("alpha-beta", "beta"))).toStrictEqual([
      `${KIT_DESIGNS_DIRECTORY}/alpha-beta/design.md`,
    ]);
  });

  test("resolves a kit to nothing when no folder bears its name or any of its words", () => {
    expect.hasAssertions();

    expect(getKitDesignPaths("alpha-beta", withFolders("gamma"))).toStrictEqual([]);
  });
});
