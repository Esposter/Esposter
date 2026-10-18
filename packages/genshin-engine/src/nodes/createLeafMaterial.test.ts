import { createLeafMaterial } from "#src/nodes/createLeafMaterial";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { DataTexture } from "three";
import { normalViewGeometry } from "three/tsl";
import { describe, expect, test } from "vitest";

describe(createLeafMaterial, () => {
  test("is never outlined, since the outline pass would draw a card's unmasked back face as a solid patch", () => {
    expect.hasAssertions();

    const leafMaterial = createLeafMaterial({ lightUniforms: createLightUniforms(), rampTexture: new DataTexture() });
    expect({
      toonFlag: leafMaterial.isMeshToonMaterial,
      toonNodeFlag: leafMaterial.isMeshToonNodeMaterial,
    }).toStrictEqual({ toonFlag: false, toonNodeFlag: false });
  });

  test("cuts its card by a mask, which the shadow pass reads where it ignores an opacity", () => {
    expect.hasAssertions();

    const leafMaterial = createLeafMaterial({ lightUniforms: createLightUniforms(), rampTexture: new DataTexture() });
    expect({
      alphaTest: leafMaterial.alphaTest,
      hasMaskNode: leafMaterial.maskNode !== null,
      hasOpacityNode: leafMaterial.opacityNode !== null,
    }).toStrictEqual({ alphaTest: 0, hasMaskNode: true, hasOpacityNode: false });
  });

  test("lights both faces of a card by the crown's normal, which three would turn round on a back face", () => {
    expect.hasAssertions();

    const leafMaterial = createLeafMaterial({ lightUniforms: createLightUniforms(), rampTexture: new DataTexture() });
    expect(leafMaterial.normalNode).toBe(normalViewGeometry);
  });
});
