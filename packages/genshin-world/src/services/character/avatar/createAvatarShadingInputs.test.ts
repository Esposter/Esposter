import { createAvatarShadingInputs } from "#src/services/character/avatar/createAvatarShadingInputs";
import { CharacterMaterialKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("createAvatarShadingInputs", () => {
  test("leaves out each value the material does not hold, so the shading keeps its default for it", () => {
    expect.assertions(1);
    const inputs = createAvatarShadingInputs(
      { colors: { _Color: [0.5, 0.25, 1, 1] }, floats: { _Shininess: 10 }, keywords: [], textures: {} },
      CharacterMaterialKind.Face,
      new Map(),
    );
    expect.assertions(1);
    expect(inputs).toStrictEqual({
      color: [0.5, 0.25, 1],
      kind: CharacterMaterialKind.Face,
      regionTints: { five: [0.5, 0.25, 1], four: [0.5, 0.25, 1], three: [0.5, 0.25, 1], two: [0.5, 0.25, 1] },
      shininess: 10,
    });
  });
});
