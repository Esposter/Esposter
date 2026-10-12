import type { PmxMaterial } from "#src/models/character/PmxMaterial";

import { createCharacterMaterial } from "#src/character/createCharacterMaterial";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { Texture } from "three";
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

describe(createCharacterMaterial, () => {
  test("lights a shared toon on its own generated ramp, and outlines it in its edge", () => {
    expect.hasAssertions();

    const rampTexture = new Texture();
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

    const toonTexture = new Texture();
    const sphereTexture = new Texture();
    const characterMaterial = createCharacterMaterial({
      lightUniforms: createLightUniforms(),
      pmxMaterial: {
        ...pmxMaterial,
        isOutlined: false,
        isToonShared: false,
        sphereMode: PmxSphereMode.Multiply,
        sphereTextureIndex: 1,
      },
      rampTexture: new Texture(),
      sphereTexture,
      toonTexture,
    });

    expect(characterMaterial.gradientMap).toBe(toonTexture);
    expect(characterMaterial.edge).toBeUndefined();
    expect(characterMaterial.isMeshToonNodeMaterial).toBe(false);
    expect(characterMaterial.sphereMap).toBe(sphereTexture);
    expect(characterMaterial.colorNode).not.toBeNull();
  });
});
