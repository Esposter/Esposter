import { createCharacterShadingInputs } from "#src/character/createCharacterShadingInputs";
import { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import { DataTexture } from "three";
import { describe, expect, test } from "vitest";

describe(createCharacterShadingInputs, () => {
  test("takes the page's defaults where nothing supplies them: region one, the body, no metal and an unlit face", () => {
    expect.hasAssertions();

    const inputs = createCharacterShadingInputs({ rampTexture: new DataTexture() });

    expect(inputs.kind).toBe(CharacterMaterialKind.Body);
    expect(inputs.regionToggles).toStrictEqual({ five: false, four: false, three: false, two: false });
    expect(inputs.metalTexture).toBeUndefined();
    expect(inputs.faceMap).toBeUndefined();
    expect(inputs.brightness).toBe(1);
  });

  test("gives each region with no tint of its own the material's colour", () => {
    expect.hasAssertions();

    const inputs = createCharacterShadingInputs({ color: [0.2, 0.4, 0.6], rampTexture: new DataTexture() });

    expect(inputs.regionTints.two).toStrictEqual([0.2, 0.4, 0.6]);
    expect(inputs.regionTints.five).toStrictEqual([0.2, 0.4, 0.6]);
  });

  test("keeps every input the caller supplies over its default", () => {
    expect.hasAssertions();

    const inputs = createCharacterShadingInputs({
      kind: CharacterMaterialKind.Hair,
      rampTexture: new DataTexture(),
      shininess: 8,
    });

    expect(inputs.kind).toBe(CharacterMaterialKind.Hair);
    expect(inputs.shininess).toBe(8);
  });
});
