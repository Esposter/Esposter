import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";
import type { SceneMaterial } from "genshin-engine";

import { WitnessProperty } from "#src/models/scene/WitnessProperty";
import { LEAF_SHADER } from "#src/services/scene/constants";
import { createWitnessMaterial } from "#src/services/scene/createWitnessMaterial";
import { ToonNodeMaterial } from "genshin-engine";
import { DoubleSide, Texture } from "three";
import { vec3 } from "three/tsl";
import { describe, expect, test } from "vitest";

const createMaterialFactory: WitnessMaterialFactory = () => new ToonNodeMaterial({}, false);

describe("createWitnessMaterial", () => {
  const DIFFUSE_NAME = "Stages_Unique_CyTree01_Leaf_Diffuse";
  const CUTOFF = 0.5;
  const TINT: [number, number, number, number] = [0.5, 1, 0.25, 1];
  const createLeafFixture = (): SceneMaterial => ({
    colors: { [WitnessProperty.Color]: TINT },
    floats: { [WitnessProperty.Cutoff]: CUTOFF },
    keywords: [],
    name: "Stages_Unique_CyTree01_Leaf_Lod0",
    shader: LEAF_SHADER,
    textures: { [WitnessProperty.MainTexture]: { name: DIFFUSE_NAME, offset: [0, 0], scale: [1, 1] } },
  });

  test("cuts a leaf card by its diffuse texture's alpha alone, drawn from both sides", () => {
    expect.hasAssertions();

    const material = createWitnessMaterial(
      createLeafFixture(),
      new Map([[DIFFUSE_NAME, new Texture()]]),
      createMaterialFactory,
    );
    expect({
      alphaTest: material.alphaTest,
      hasMaskNode: material.maskNode !== null,
      hasOpacityNode: material.opacityNode !== null,
      isLeafCard: material.userData.isLeafCard,
      side: material.side,
    }).toStrictEqual({ alphaTest: 0, hasMaskNode: true, hasOpacityNode: false, isLeafCard: true, side: DoubleSide });
  });

  test("draws no rim glow of the export's own, so the walkway's middle lane keeps the host's glow alone", () => {
    expect.hasAssertions();

    const hostGlowNode = vec3(0);
    const walkwayMaterial = createWitnessMaterial(
      {
        colors: { _RGColor: [0.7, 0.96, 1, 1] },
        floats: { _EnableRimGlow: 1, _RGPower: 2, _RGStrength: 1, [WitnessProperty.EmissionType]: 0 },
        keywords: ["EMISSION_TYPE_NONE", "ENABLE_RIM_GLOW_ON"],
        name: "LoginScene_Ground02",
        shader: "miHoYo/Scene/Login Base",
        textures: {},
      },
      new Map(),
      () => Object.assign(new ToonNodeMaterial({}, false), { emissiveNode: hostGlowNode }),
    );

    expect(walkwayMaterial.emissiveNode).toBe(hostGlowNode);
  });
});
