import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";

import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { describe, expect, test } from "vitest";

describe(toMaterialValues, () => {
  test("keeps the filled texture slots and reads colours as linear tuples, alpha as saved", () => {
    expect.hasAssertions();

    const tiling = { m_Offset: { X: 0, Y: 0 }, m_Scale: { X: 1, Y: 1 } };
    const material: ExportedMaterial = {
      m_Name: "",
      m_SavedProperties: {
        m_Colors: { _Color: { a: 0.5, b: 0, g: 0.5, r: 1 } },
        m_Floats: { _Metal: 1 },
        m_TexEnvs: {
          _BumpMap: { ...tiling, m_Texture: { IsNull: true, m_FileID: 0, m_PathID: "0" } },
          _MainTex: { ...tiling, m_Texture: { IsNull: false, m_FileID: 1, m_PathID: "1" } },
        },
      },
      m_Shader: { IsNull: false, m_FileID: 0, m_PathID: "2" },
    };

    expect(toMaterialValues(material)).toStrictEqual({
      colors: { _Color: [1, 0.21404114048223255, 0, 0.5] },
      floats: { _Metal: 1 },
      keywords: [],
      name: "",
      shaderPathId: "2",
      textures: { _MainTex: { fileIndex: 1, offset: [0, 0], pathId: "1", scale: [1, 1] } },
    });
  });

  test("carries the keywords the material is read with", () => {
    expect.hasAssertions();

    const material: ExportedMaterial = {
      m_Name: "",
      m_SavedProperties: { m_Colors: null, m_Floats: null, m_TexEnvs: {} },
      m_Shader: { IsNull: false, m_FileID: 0, m_PathID: "0" },
    };

    expect(toMaterialValues(material, ["A", "B"]).keywords).toStrictEqual(["A", "B"]);
  });
});
