import { readAssetsMatching } from "#src/services/genshinAssets/shared/readAssetsMatching";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(readAssetsMatching, () => {
  const FIXTURE_LINES = [
    "Eff_Water_Ripple_03\tParticleSystem\t00/00000890.blk\t5392588180762424420\t0",
    "Eff_Water_Ripple_04\tMesh\t00/00000891.blk\t42\t1",
    "Eff_Cast_01\tMesh\t00/00000891.blk\t43\t1",
  ];
  let directory = "";
  let indexPath = "";

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "index-find-"));
    indexPath = join(directory, "index.tsv");
    await writeFile(indexPath, `${FIXTURE_LINES.join("\n")}\n`);
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("a name pattern prints each index row's type, block and path ID", async () => {
    expect.hasAssertions();

    await expect(
      readAssetsMatching(/^Eff_Water_Ripple_/u, { indexCommand: "tool map", indexPath }),
    ).resolves.toStrictEqual([
      {
        block: "00/00000890.blk",
        name: "Eff_Water_Ripple_03",
        offset: 0,
        pathId: "5392588180762424420",
        type: "ParticleSystem",
      },
      { block: "00/00000891.blk", name: "Eff_Water_Ripple_04", offset: 1, pathId: "42", type: "Mesh" },
    ]);
  });
});
