import type { SkinnedRenderer } from "#src/services/genshinAssets/avatar/readRendererBones";

import { readSkinnedRenderers } from "#src/services/genshinAssets/avatar/readRendererBones";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// A pointer as a dump holds it, naming the path ID of its file index's object
const pointer = (m_FileID: number, m_PathID: number): { m_FileID: number; m_PathID: number } => ({
  m_FileID,
  m_PathID,
});
const byMeshPathId = (firstRenderer: SkinnedRenderer, secondRenderer: SkinnedRenderer): number =>
  (firstRenderer.mesh?.pathId ?? "").localeCompare(secondRenderer.mesh?.pathId ?? "");

describe(readSkinnedRenderers, () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "skinned-renderers-"));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("resolves a mesh whose pointer names a second CAB to that CAB, and one with no file index to its own", async () => {
    expect.hasAssertions();

    const cabMap = new Map([
      ["cab-a", { block: "00/a.blk", dependencies: ["cab-b"], offset: 1 }],
      ["cab-b", { block: "00/b.blk", dependencies: [], offset: 2 }],
    ]);
    const cabDirectory = join(directory, "00", "SkinnedMeshRenderer", "cab-a");
    await mkdir(cabDirectory, { recursive: true });
    const renderer = (m_Mesh: { m_FileID: number; m_PathID: number }) => ({
      m_Bones: [],
      m_GameObject: pointer(0, 1),
      m_Materials: [],
      m_Mesh,
      m_RootBone: pointer(0, 0),
    });
    await writeFile(join(cabDirectory, "SkinnedMeshRenderer#1.json"), JSON.stringify(renderer(pointer(1, 7))));
    await writeFile(join(cabDirectory, "SkinnedMeshRenderer#2.json"), JSON.stringify(renderer(pointer(0, 9))));

    const renderers = await readSkinnedRenderers(directory, cabMap);

    expect(renderers.toSorted(byMeshPathId).map(({ file, mesh }) => ({ file, mesh }))).toStrictEqual([
      { file: "cab-a", mesh: { block: "00/b.blk", file: "cab-b", pathId: "7" } },
      { file: "cab-a", mesh: { block: "00/a.blk", file: "cab-a", pathId: "9" } },
    ]);
  });
});
