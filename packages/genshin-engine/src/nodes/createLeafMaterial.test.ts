import { createLeafMaterial } from "#src/nodes/createLeafMaterial";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { DataTexture } from "three";
import { describe, expect, test } from "vitest";

describe(createLeafMaterial, () => {
  test("is never outlined, since the outline pass would draw a card's unmasked back face as a solid patch", () => {
    const leafMaterial = createLeafMaterial({ lightUniforms: createLightUniforms(), rampTexture: new DataTexture() });
    expect({
      toonFlag: leafMaterial.isMeshToonMaterial,
      toonNodeFlag: leafMaterial.isMeshToonNodeMaterial,
    }).toStrictEqual({ toonFlag: false, toonNodeFlag: false });
  });
});
