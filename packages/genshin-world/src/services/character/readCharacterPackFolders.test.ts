import { readCharacterPackFolders } from "#src/services/character/readCharacterPackFolders";
import { describe, expect, test } from "vitest";

const createFile = (path: string) => Object.defineProperty(new File([""], path), "webkitRelativePath", { value: path });

describe(readCharacterPackFolders, () => {
  test("reads each folder holding a model as a release of its own", () => {
    expect.hasAssertions();

    const releases = readCharacterPackFolders([
      createFile("Packs/A/a.pmx"),
      createFile("Packs/A/tex/x.png"),
      createFile("Packs/B/b.pmx"),
    ]);

    expect(releases.map(({ name, paths }) => ({ name, paths }))).toStrictEqual([
      { name: "A", paths: ["Packs/A/a.pmx", "Packs/A/tex/x.png"] },
      { name: "B", paths: ["Packs/B/b.pmx"] },
    ]);
  });

  test("reads a folder holding a release's own files as one release", () => {
    expect.hasAssertions();

    const releases = readCharacterPackFolders([createFile("Pack/a.pmx"), createFile("Pack/tex/x.png")]);

    expect(releases.map(({ name, paths }) => ({ name, paths }))).toStrictEqual([
      { name: "Pack", paths: ["Pack/a.pmx", "Pack/tex/x.png"] },
    ]);
  });
});
