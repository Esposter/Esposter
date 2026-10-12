import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";

import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { describe, expect, test } from "vitest";

describe(toMaterialValues, () => {
  const tiling = { m_Offset: { X: 0, Y: 0 }, m_Scale: { X: 1, Y: 1 } };
  const material: ExportedMaterial = {
    m_Name: "Stone",
    m_SavedProperties: {
      m_Colors: {
        _Color: { a: 0.5, b: 0, g: 0.5, r: 1 },
        _Knots: { a: 0, b: 6, g: 2, r: 0.5 },
        _Spec: { a: 1, b: 0.5, g: 0.5, r: 0.5 },
      },
      m_Floats: { _Metal: 1 },
      m_TexEnvs: {
        _BumpMap: { ...tiling, m_Texture: { IsNull: true, m_FileID: 0, m_PathID: "0" } },
        _MainTex: { ...tiling, m_Texture: { IsNull: false, m_FileID: 1, m_PathID: "1" } },
      },
    },
    m_Shader: { IsNull: false, m_FileID: 0, m_PathID: "2" },
  };

  test("keeps the filled texture slots, decodes every colour but the shader's vectors to linear", () => {
    expect.hasAssertions();

    expect(
      toMaterialValues(material, ["A"], { colorNames: new Set(["_Color"]), vectorNames: new Set(["_Knots"]) }),
    ).toStrictEqual({
      colors: {
        _Color: [1, 0.21404114048223255, 0, 0.5],
        _Knots: [0.5, 2, 6, 0],
        _Spec: [0.21404114048223255, 0.21404114048223255, 0.21404114048223255, 1],
      },
      floats: { _Metal: 1 },
      keywords: ["A"],
      name: "Stone",
      shaderPathId: "2",
      textures: { _MainTex: { fileIndex: 1, offset: [0, 0], pathId: "1", scale: [1, 1] } },
    });
  });

  test("throws on a name its shader declares both a colour and a vector", () => {
    expect.hasAssertions();

    expect(() =>
      toMaterialValues(material, [], { colorNames: new Set(["_Color"]), vectorNames: new Set(["_Color"]) }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: _Color, is both a colour and a vector of Stone's shader]`,
    );
  });
});
