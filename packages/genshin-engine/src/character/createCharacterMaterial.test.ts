import type { PmxMaterial } from "#src/models/character/PmxMaterial";

import { createCharacterMaterial } from "#src/character/createCharacterMaterial";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { DataTexture, DoubleSide, FrontSide } from "three";
import { diffuseColor } from "three/tsl";
import { describe, expect, test } from "vitest";

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

// Whether a node is the target or reads it through its operands, so a test can find a term inside a material's graph
const reaches = (node: unknown, target: unknown): boolean => {
  if (node === target) return true;
  if (!(node instanceof Object)) return false;
  return ["aNode", "bNode", "node"].some((key) => key in node && reaches(Reflect.get(node, key), target));
};

describe(createCharacterMaterial, () => {
  test("lights a shared toon on its own generated ramp, and outlines it in its edge", () => {
    expect.hasAssertions();

    const rampTexture = new DataTexture();
    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial,
      rampTexture,
    });

    expect(characterMaterial.gradientMap).toBe(getSharedToonRamp(2));
    expect(characterMaterial.edge).toStrictEqual({ color: [0, 0, 0, 1], size: 1 });
    expect(characterMaterial.isMeshToonNodeMaterial).toBe(true);
    expect(characterMaterial.colorNode).toBeNull();
    expect(characterMaterial.sphereMap).toBeUndefined();
  });

  test("lights a material whose toon is a texture of its model on that texture, and multiplies its sphere map", () => {
    expect.hasAssertions();

    const toonTexture = new DataTexture();
    const sphereTexture = new DataTexture();
    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: {
        ...pmxMaterial,
        isOutlined: false,
        isToonShared: false,
        sphereMode: PmxSphereMode.Multiply,
        sphereTextureIndex: 1,
      },
      rampTexture: new DataTexture(),
      sphereTexture,
      toonTexture,
    });

    expect(characterMaterial.gradientMap).toBe(toonTexture);
    expect(characterMaterial.edge).toBeUndefined();
    expect(characterMaterial.isMeshToonNodeMaterial).toBe(false);
    expect(characterMaterial.sphereMap).toBe(sphereTexture);
    expect(characterMaterial.colorNode).not.toBeNull();
  });

  test("draws its sub-texture as a sphere map on the coordinates of the vertex's own extra vector", () => {
    expect.hasAssertions();

    const sphereTexture = new DataTexture();
    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: {
        ...pmxMaterial,
        isOutlined: false,
        isToonShared: false,
        sphereMode: PmxSphereMode.AdditionalUv,
        sphereTextureIndex: 1,
      },
      rampTexture: new DataTexture(),
      sphereTexture,
      toonTexture: new DataTexture(),
    });

    expect(characterMaterial.sphereMap).toBe(sphereTexture);
    expect(characterMaterial.colorNode).not.toBeNull();
  });

  test("tints its ambient by its diffuse colour, so the light it adds keeps the material's own colour", () => {
    expect.hasAssertions();

    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture: new DataTexture(),
    });

    expect(reaches(characterMaterial.emissiveNode, diffuseColor)).toBe(true);
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

    const rampTexture = new DataTexture();
    const clearTexels = createCharacterMaterial({
      isTextureTransparent: true,
      lightUniforms: createLightUniforms(),
      pmxMaterial: { ...pmxMaterial, isOutlined: false },
      rampTexture,
    });

    expect(clearTexels.transparent).toBe(true);
    expect(clearTexels.side).toBe(DoubleSide);
  });
});
