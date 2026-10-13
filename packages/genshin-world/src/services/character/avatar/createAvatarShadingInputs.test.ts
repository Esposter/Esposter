import { createAvatarShadingInputs } from "#src/services/character/avatar/createAvatarShadingInputs";
import { CharacterMaterialKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("createAvatarShadingInputs", () => {
  // Every region at white, the shading's own default for a region a material holds no colour for
  const WHITE_REGIONS = { five: [1, 1, 1], four: [1, 1, 1], one: [1, 1, 1], three: [1, 1, 1], two: [1, 1, 1] };

  test("leaves out each value the material does not hold, so the shading keeps its default for it", () => {
    expect.assertions(2);
    const inputs = createAvatarShadingInputs(
      { colors: { _Color: [0.5, 0.25, 1, 1] }, floats: { _Shininess: 10 }, keywords: [], textures: {} },
      CharacterMaterialKind.Face,
      new Map(),
    );
    const { faceDraw, ...rest } = inputs;
    expect(rest).toStrictEqual({
      color: [0.5, 0.25, 1],
      coolShadowMultiplyColors: WHITE_REGIONS,
      isOutlineVertexWeighted: true,
      kind: CharacterMaterialKind.Face,
      outlineRegions: {
        colors: { five: [0, 0, 0], four: [0, 0, 0], one: [0, 0, 0], three: [0, 0, 0], two: [0, 0, 0] },
        intensities: { five: 0, four: 0, one: 0, three: 0, two: 0 },
      },
      regionTints: { five: [0.5, 0.25, 1], four: [0.5, 0.25, 1], three: [0.5, 0.25, 1], two: [0.5, 0.25, 1] },
      regionToggles: { five: false, four: false, three: false, two: false },
      shadowMultiplyColors: WHITE_REGIONS,
      shininess: 10,
    });
    // The face draw is always made, since the frame sets it, and a material with no flip or offset takes the defaults
    expect(faceDraw?.rotateOffset).toBe(0);
  });

  test("reads the ramp width the material gives, and leaves the shading's default where it gives none", () => {
    expect.assertions(2);
    const { rampWidth } = createAvatarShadingInputs(
      { colors: {}, floats: { _ShadowRampWidth: 0.8 }, keywords: [], textures: {} },
      CharacterMaterialKind.Body,
      new Map(),
    );
    const { rampWidth: missingRampWidth } = createAvatarShadingInputs(
      { colors: {}, floats: {}, keywords: [], textures: {} },
      CharacterMaterialKind.Body,
      new Map(),
    );

    expect(rampWidth).toBe(0.8);
    expect(missingRampWidth).toBeUndefined();
  });

  test("turns on each later region the material turns on", () => {
    expect.assertions(1);
    const { regionToggles } = createAvatarShadingInputs(
      { colors: {}, floats: { _UseMaterial2: 1, _UseMaterial3: 1, _UseMaterial4: 0 }, keywords: [], textures: {} },
      CharacterMaterialKind.Body,
      new Map(),
    );

    expect(regionToggles).toStrictEqual({ five: false, four: false, three: true, two: true });
  });

  test("reads each region's first and cool shadow colour, white where the material holds none", () => {
    expect.assertions(2);
    const inputs = createAvatarShadingInputs(
      {
        colors: {
          _CoolShadowMultColor: [0.2, 0.2, 0.3, 1],
          _CoolShadowMultColor3: [0.1, 0.1, 0.2, 1],
          _FirstShadowMultColor: [0.9, 0.5, 0.4, 1],
          _FirstShadowMultColor2: [0.5, 0.3, 0.3, 1],
        },
        floats: { _UseCoolShadowColorOrTex: 1 },
        keywords: [],
        textures: {},
      },
      CharacterMaterialKind.Face,
      new Map(),
    );
    expect(inputs.shadowMultiplyColors).toStrictEqual({
      five: [1, 1, 1],
      four: [1, 1, 1],
      one: [0.9, 0.5, 0.4],
      three: [1, 1, 1],
      two: [0.5, 0.3, 0.3],
    });
    expect(inputs.coolShadowMultiplyColors).toStrictEqual({
      five: [1, 1, 1],
      four: [1, 1, 1],
      one: [0.2, 0.2, 0.3],
      three: [0.1, 0.1, 0.2],
      two: [1, 1, 1],
    });
  });
});
