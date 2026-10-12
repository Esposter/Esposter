import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";

import { createCharacterShadingInputs } from "#src/character/createCharacterShadingInputs";
import { createCharacterShadingNode } from "#src/character/shading/createCharacterShadingNode";
import { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { DataTexture } from "three";
import { describe, expect, test } from "vitest";

const inputsOf = (overrides: Partial<CharacterShadingInputs> = {}): CharacterShadingInputs =>
  createCharacterShadingInputs({ rampTexture: new DataTexture(), ...overrides });

describe(createCharacterShadingNode, () => {
  test("builds the body from its inputs without a lightmap, the defaults standing in", () => {
    expect.hasAssertions();

    expect(createCharacterShadingNode(inputsOf(), createLightUniforms())).not.toBeNull();
  });

  test("builds the hair and the face through their own paths, with no metal branch to read", () => {
    expect.hasAssertions();

    const lightUniforms = createLightUniforms();
    const hair = createCharacterShadingNode(
      inputsOf({ kind: CharacterMaterialKind.Hair, metalTexture: new DataTexture() }),
      lightUniforms,
    );
    const face = createCharacterShadingNode(
      inputsOf({ faceMap: new DataTexture(), kind: CharacterMaterialKind.Face }),
      lightUniforms,
    );

    expect(hair).not.toBeNull();
    expect(face).not.toBeNull();
  });
});
