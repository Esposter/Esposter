import { readMeshAssets } from "#src/services/genshinAssets/shared/readMeshAssets";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(readMeshAssets, () => {
  const FIXTURE_LINES = [
    "Level_Ndkl_Prop_Deer_A_03\tMesh\t00/00000891.blk\t42\t1",
    "Level_Ndkl_Prop_Deer_A_03\tTexture2D\t00/00000890.blk\t5392588180762424420\t0",
    "Level_Ndkl_Prop_Deer_A_03\tMesh\t00/00000892.blk\t43\t1",
  ];
  let directory = "";
  let options = { indexCommand: "tool map", indexPath: "" };

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "mesh-index-"));
    options = { indexCommand: "tool map", indexPath: join(directory, "index.tsv") };
    await writeFile(options.indexPath, `${FIXTURE_LINES.join("\n")}\n`);
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("names each mesh of the name with its block and path ID, and no other type", async () => {
    expect.hasAssertions();

    await expect(readMeshAssets("Level_Ndkl_Prop_Deer_A_03", options)).resolves.toStrictEqual([
      { block: "00/00000891.blk", name: "Level_Ndkl_Prop_Deer_A_03", offset: 1, pathId: "42", type: "Mesh" },
      { block: "00/00000892.blk", name: "Level_Ndkl_Prop_Deer_A_03", offset: 1, pathId: "43", type: "Mesh" },
    ]);
  });

  test("refuses a name the index holds no mesh under", async () => {
    expect.hasAssertions();

    await expect(readMeshAssets("Level_Ndkl_Prop_Deer_A_02", options)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Level_Ndkl_Prop_Deer_A_02, names no mesh in the asset index]`,
    );
  });
});
