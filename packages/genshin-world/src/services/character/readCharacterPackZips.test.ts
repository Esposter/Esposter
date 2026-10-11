import { readCharacterPackZips } from "#src/services/character/readCharacterPackZips";
import { zipSync } from "fflate";
import { describe, expect, test } from "vitest";

describe(readCharacterPackZips, () => {
  test("reads each zip it can and names the one it cannot, leaving the rest of the pick read", async () => {
    expect.hasAssertions();

    const goodZip = zipSync({ "Pack/a.pmx": new Uint8Array([1]) });
    const { failures, pickedCharacterPacks } = await readCharacterPackZips([
      new File([new Uint8Array([0, 1, 2, 3])], "bad.zip"),
      new File([goodZip], "good.zip"),
    ]);

    expect(pickedCharacterPacks.map(({ name, paths }) => ({ name, paths }))).toStrictEqual([
      { name: "good.zip", paths: ["Pack/a.pmx"] },
    ]);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/^bad\.zip: /u);
  });
});
