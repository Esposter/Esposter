import type { SerializedPass } from "#src/models/genshinAssets/materials/SerializedPass";
import type { SerializedShader } from "#src/models/genshinAssets/materials/SerializedShader";
import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";

import { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";
import { BLEND_MODE, DEPTH_WRITE } from "#src/services/genshinAssets/effects/constants";
import { listEffectShaders } from "#src/services/genshinAssets/effects/listEffectShaders";
import { describe, expect, test } from "vitest";

// A state value the export holds with no driving property name
const literal = (value: number) => ({ name: "", value });

// A shader with one subshader and one pass whose first render target blends with the given factors and whose depth write
// Is the given value
const createShader = (source: number, destination: number, zWrite: number): SerializedShader => {
  const state: SerializedShaderState = {
    blend: {
      colorMask: literal(15),
      destination: literal(destination),
      operation: literal(0),
      source: literal(source),
    },
    depth: { cull: literal(0), zTest: literal(4), zWrite: literal(zWrite) },
  };
  const pass: SerializedPass = {
    keywordNames: new Map(),
    name: "",
    state,
    subPrograms: {
      [ShaderProgramStage.Domain]: [],
      [ShaderProgramStage.Fragment]: [],
      [ShaderProgramStage.Geometry]: [],
      [ShaderProgramStage.Hull]: [],
      [ShaderProgramStage.Vertex]: [],
    },
  };
  return { name: "", subShaders: [{ passes: [pass] }] };
};

describe(listEffectShaders, () => {
  test("a shader is listed as an effect by its blend state", () => {
    expect.hasAssertions();

    const listings = listEffectShaders([
      {
        block: "",
        folder: "",
        shader: createShader(BLEND_MODE.SrcAlpha, BLEND_MODE.OneMinusSrcAlpha, DEPTH_WRITE.Off),
      },
      { block: "", folder: " ", shader: createShader(BLEND_MODE.One, BLEND_MODE.Zero, DEPTH_WRITE.On) },
    ]);

    expect(listings.map(({ folder, isEffect }) => ({ folder, isEffect }))).toStrictEqual([
      { folder: "", isEffect: true },
      { folder: " ", isEffect: false },
    ]);
  });
});
