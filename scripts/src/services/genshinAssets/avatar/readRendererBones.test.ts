import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";

import { readRendererBones } from "#src/services/genshinAssets/avatar/readRendererBones";
import { describe, expect, test } from "vitest";

// A skinned renderer of the given bones, each a pointer to a transform of the renderer's own CAB
const skinnedRenderer = (bones: SkinnedRenderer["bones"][number][], boneCount: number): SkinnedRenderer => ({
  bones,
  file: "cab-a",
  materials: [],
  renderer: {
    m_Bones: Array.from({ length: boneCount }, (_value, index) => ({ m_FileID: 0, m_PathID: `${index}` })),
    m_GameObject: { m_PathID: "" },
    m_Materials: [],
    m_Mesh: { m_FileID: 0, m_PathID: "" },
    m_RootBone: { m_FileID: 0, m_PathID: "" },
  },
});

// A mesh with the given bind poses and no geometry, as far as the renderer's bones are concerned
const createMesh = (m_BindPose: DumpedMesh["m_BindPose"]): DumpedMesh => ({
  m_BindPose,
  m_Colors: [],
  m_Indices: [],
  m_Normals: [],
  m_Skin: [],
  m_SubMeshes: [],
  m_UV0: [],
  m_VertexCount: 0,
  m_Vertices: [],
});

describe(readRendererBones, () => {
  test("throws when the mesh's bind poses do not match the renderer's bones", () => {
    expect.hasAssertions();

    const skinned = skinnedRenderer([{ block: "00/a.blk", file: "cab-a", pathId: "1" }], 1);

    expect(() =>
      readRendererBones(skinned, "Body", createMesh([{}, {}]), new Map()),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Body, has 2 bind poses for a renderer of 1 bones]`,
    );
  });

  test("throws when a bone the renderer names is not placed in the rig", () => {
    expect.hasAssertions();

    const skinned = skinnedRenderer([undefined], 1);

    expect(() => readRendererBones(skinned, "Body", createMesh([{}]), new Map())).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Body, has a bone the layout does not place in the rig]`,
    );
  });
});
