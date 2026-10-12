import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";
import type { SkinnedRenderer } from "#src/services/genshinAssets/avatar/readRendererBones";

import { readRendererBones } from "#src/services/genshinAssets/avatar/readRendererBones";
import { describe, expect, test } from "vitest";

// A skinned renderer of the given bones, each a pointer to a transform of the renderer's own CAB
const skinnedRenderer = (bones: SkinnedRenderer["bones"][number][], boneCount: number): SkinnedRenderer => ({
  bones,
  file: "cab-a",
  materials: [],
  renderer: {
    m_Bones: Array.from({ length: boneCount }, (_value, index) => ({ m_FileID: 0, m_PathID: `${index}` })),
  } as unknown as DumpedSkinnedMeshRenderer,
});

describe(readRendererBones, () => {
  test("throws when the mesh's bind poses do not match the renderer's bones", () => {
    expect.hasAssertions();

    const skinned = skinnedRenderer([{ block: "00/a.blk", file: "cab-a", pathId: "1" }], 1);

    expect(() =>
      readRendererBones(skinned, "Body", { m_BindPose: [{}, {}] } as unknown as DumpedMesh, new Map()),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Body, has 2 bind poses for a renderer of 1 bones]`,
    );
  });

  test("throws when a bone the renderer names is not placed in the rig", () => {
    expect.hasAssertions();

    const skinned = skinnedRenderer([undefined], 1);

    expect(() =>
      readRendererBones(skinned, "Body", { m_BindPose: [{}] } as unknown as DumpedMesh, new Map()),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Body, has a bone the layout does not place in the rig]`,
    );
  });
});
