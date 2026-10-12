import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";

import { buildAvatarMesh } from "#src/services/genshinAssets/avatar/buildAvatarMesh";
import { createAvatarBinary } from "#src/services/genshinAssets/avatar/writeAvatarBinary";
import { describe, expect, test } from "vitest";

describe(buildAvatarMesh, () => {
  test("mirrors the axes across x, turns each triangle to keep its face, and maps joints to rig nodes", () => {
    expect.hasAssertions();

    const binary = createAvatarBinary();
    const mesh: DumpedMesh = {
      m_BoneNameHashes: [0, 0],
      m_Colors: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      m_Indices: [0, 1, 2],
      m_Normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
      m_Skin: [
        { boneIndex: [1, 0, 0, 0], weight: [1, 0, 0, 0] },
        { boneIndex: [0, 0, 0, 0], weight: [1, 0, 0, 0] },
        { boneIndex: [0, 0, 0, 0], weight: [1, 0, 0, 0] },
      ],
      m_SubMeshes: [{ indexCount: 3 }],
      m_Tangents: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      m_UV0: [0, 0, 1, 0, 0, 1],
      m_VertexCount: 3,
      m_Vertices: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };

    const built = buildAvatarMesh("Body", mesh, [5, 7], ["Hair"], binary);
    const buffer = binary.toBuffer();
    const read = <T extends Float32Array | Uint16Array>(
      view: { length: number; offset: number },
      Type: new (buffer: ArrayBufferLike, byteOffset: number, length: number) => T,
    ): T => new Type(buffer.buffer, buffer.byteOffset + view.offset, view.length);

    expect([...read(built.positions, Float32Array)]).toStrictEqual([-1, 2, 3, -4, 5, 6, -7, 8, 9]);
    expect([...read(built.indices, Uint16Array)]).toStrictEqual([0, 2, 1]);
    expect([...read(built.joints, Uint16Array)].slice(0, 4)).toStrictEqual([7, 5, 5, 5]);
    expect(built.submeshes).toStrictEqual([{ count: 3, material: "Hair", start: 0 }]);
  });
});
