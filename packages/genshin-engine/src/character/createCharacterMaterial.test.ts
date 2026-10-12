import type { PmxMaterial } from "#src/models/character/PmxMaterial";

import { createCharacterMaterial } from "#src/character/createCharacterMaterial";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { DataTexture, DoubleSide, FrontSide } from "three";
import { describe, expect, test } from "vitest";

describe(createCharacterMaterial, () => {
  const pmxMaterial: PmxMaterial = {
    ambientColor: [0.5, 0.5, 0.5],
    diffuseColor: [1, 1, 1, 1],
    edgeColor: [0, 0, 0, 1],
    edgeSize: 1,
    indexCount: 3,
    isDoubleSided: false,
    isOutlined: true,
    isToonShared: true,
    name: "",
    specularColor: [0, 0, 0],
    specularity: 1,
    sphereMode: PmxSphereMode.Disabled,
    sphereTextureIndex: -1,
    textureIndex: -1,
    toonIndex: 2,
  };

  test("is shaded by its own output rather than three's lights, and outlines it in its edge with the body's knot widths", () => {
    expect.hasAssertions();

    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial,
      rampTexture: new DataTexture(),
    });

    expect(characterMaterial.lights).toBe(false);
    expect(characterMaterial.outputNode).not.toBeNull();
    expect(characterMaterial.edge).toStrictEqual({
      color: [0, 0, 0, 1],
      isVertexWeighted: false,
      offset: undefined,
      size: 1,
      widthKnots: { depths: [1, 2, 3], scales: [1, 1, 1] },
    });
    expect(characterMaterial.isMeshToonNodeMaterial).toBe(true);
  });

  test("takes its edge's colour as the material's colour under its edge, toned", () => {
    expect.hasAssertions();

    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, diffuseColor: [0.5, 0.5, 0.5, 1], edgeColor: [1, 0, 0, 1] },
      rampTexture: new DataTexture(),
    });

    expect(characterMaterial.edge?.color).toStrictEqual([0.5, 0, 0, 1]);
  });

  test("draws its sphere as the metal map where its mode names one, and sets it for release", () => {
    expect.hasAssertions();

    const sphereTexture = new DataTexture();
    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false, sphereMode: PmxSphereMode.Multiply, sphereTextureIndex: 1 },
      rampTexture: new DataTexture(),
      sphereTexture,
    });

    expect(characterMaterial.sphereMap).toBe(sphereTexture);
    expect(characterMaterial.edge).toBeUndefined();
  });

  test("outlines a solid material whose file sets no edge by the world's outline, and leaves a transparent one bare", () => {
    expect.hasAssertions();

    const rampTexture = new DataTexture();
    const solid = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture,
    });
    const translucent = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, diffuseColor: [1, 1, 1, 0.5], isOutlined: false },
      rampTexture,
    });

    expect(solid.isMeshToonMaterial).toBe(true);
    expect(solid.edge).toBeUndefined();
    expect(translucent.isMeshToonMaterial).toBe(false);
  });

  test("keeps the sphere off a material whose mode is disabled", () => {
    expect.hasAssertions();

    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture: new DataTexture(),
      sphereTexture: new DataTexture(),
    });

    expect(characterMaterial.sphereMap).toBeUndefined();
  });

  test("is drawn at no opacity as hidden, so its depth hides nothing", () => {
    expect.hasAssertions();

    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, diffuseColor: [1, 1, 1, 0], isOutlined: false },
      rampTexture: new DataTexture(),
    });

    expect(characterMaterial.visible).toBe(false);
  });

  test("blends a partly transparent material and draws it from both faces, and draws a solid one from its front", () => {
    expect.hasAssertions();

    const rampTexture = new DataTexture();
    const translucent = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, diffuseColor: [1, 1, 1, 0.5], isOutlined: false },
      rampTexture,
    });
    const solid = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture,
    });

    expect(translucent.transparent).toBe(true);
    expect(translucent.side).toBe(DoubleSide);
    expect(solid.transparent).toBe(false);
    expect(solid.side).toBe(FrontSide);
  });

  test("blends a material whose texture has clear texels", () => {
    expect.hasAssertions();

    const clearTexels = createCharacterMaterial({
      isTextureTransparent: true,
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture: new DataTexture(),
    });

    expect(clearTexels.transparent).toBe(true);
    expect(clearTexels.side).toBe(DoubleSide);
  });
});
