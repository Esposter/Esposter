import type { ExportedMaterial } from "#src/models/genshinAssets/ExportedMaterial";

import { readMaterialValues } from "#src/services/genshinAssets/readMaterialValues";
import { describe, expect, test } from "vitest";

describe(readMaterialValues, () => {
  test("keeps the filled texture slots and reads colours as tuples", () => {
    expect.hasAssertions();

    const tiling = { m_Offset: { X: 0, Y: 0 }, m_Scale: { X: 1, Y: 1 } };
    const material: ExportedMaterial = {
      m_Name: "",
      m_SavedProperties: {
        m_Colors: { _Color: { a: 1, b: 0, g: 0, r: 1 } },
        m_Floats: { _Metal: 1 },
        m_TexEnvs: {
          _BumpMap: { ...tiling, m_Texture: { IsNull: true, m_FileID: 0, m_PathID: "0" } },
          _MainTex: { ...tiling, m_Texture: { IsNull: false, m_FileID: 0, m_PathID: "1" } },
        },
      },
      m_Shader: { IsNull: false, m_FileID: 0, m_PathID: "2" },
    };

    expect(readMaterialValues(material)).toStrictEqual({
      colors: { _Color: [1, 0, 0, 1] },
      floats: { _Metal: 1 },
      name: "",
      shaderPathId: "2",
      textures: { _MainTex: { offset: [0, 0], pathId: "1", scale: [1, 1] } },
    });
  });
});
