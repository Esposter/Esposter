import { parseIndexLine, readIndexedAssetsFrom } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { takeOne } from "@esposter/shared";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const FIXTURE_LINES = [
  "Level_Ndkl_Prop_Deer_A_02_Diffuse\tTexture2D\t00/00000890.blk\t5392588180762424420",
  "Level_Ndkl_Prop_Deer_A_02A\tMaterial\t00/00000890.blk\t6735159121891599778",
  "Orphan\tMesh\t\t-1",
  "Level_Ndkl_Prop_Deer_A_03\tMesh\t00/00000891.blk\t42",
];

describe(parseIndexLine, () => {
  test("reads a line's name, type, block and path ID", () => {
    expect.hasAssertions();

    expect(parseIndexLine(takeOne(FIXTURE_LINES))).toStrictEqual({
      block: "00/00000890.blk",
      name: "Level_Ndkl_Prop_Deer_A_02_Diffuse",
      pathId: "5392588180762424420",
      type: "Texture2D",
    });
  });

  test("reads no asset from a line with no block", () => {
    expect.hasAssertions();

    expect(parseIndexLine(takeOne(FIXTURE_LINES, 2))).toBeUndefined();
  });
});

describe(readIndexedAssetsFrom, () => {
  let directory = "";
  let indexPath = "";

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "index-"));
    indexPath = join(directory, "index.tsv");
    await writeFile(indexPath, `${FIXTURE_LINES.join("\n")}\n`);
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("keeps only the rows the predicate keeps, in file order", async () => {
    expect.hasAssertions();

    await expect(readIndexedAssetsFrom(indexPath, ({ type }) => type === "Mesh")).resolves.toStrictEqual([
      { block: "00/00000891.blk", name: "Level_Ndkl_Prop_Deer_A_03", pathId: "42", type: "Mesh" },
    ]);
  });
});
