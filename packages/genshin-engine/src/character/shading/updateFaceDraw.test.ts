import { createFaceDraw, updateFaceDraw } from "#src/character/shading/updateFaceDraw";
import { Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(updateFaceDraw, () => {
  // A root bone at the identity, whose Y and Z axes are the world's, so a light's dot products are its components
  const UNROTATED_ROOT = new Quaternion();

  test("a light along the root's Y axis holds the threshold at its minimum", () => {
    expect.assertions(1);
    const faceDraw = createFaceDraw();
    updateFaceDraw(faceDraw, new Vector3(0, 1, 0), UNROTATED_ROOT);
    expect(faceDraw.threshold.value).toBe(1e-4);
  });

  test("a light against the root's Y axis takes the threshold to its maximum", () => {
    expect.assertions(1);
    const faceDraw = createFaceDraw();
    updateFaceDraw(faceDraw, new Vector3(0, -1, 0), UNROTATED_ROOT);
    expect(faceDraw.threshold.value).toBe(0.9999);
  });

  test("the face flips where the light's angle is positive, and the material's flip factor forces it either way", () => {
    expect.assertions(3);
    const faceDraw = createFaceDraw();
    updateFaceDraw(faceDraw, new Vector3(0, 1, -1).normalize(), UNROTATED_ROOT);
    expect(faceDraw.flip.value).toBe(1);
    updateFaceDraw(faceDraw, new Vector3(0, 1, 1).normalize(), UNROTATED_ROOT);
    expect(faceDraw.flip.value).toBe(0);
    const forcedFaceDraw = createFaceDraw({ flipFactor: 1 });
    updateFaceDraw(forcedFaceDraw, new Vector3(0, 1, 1).normalize(), UNROTATED_ROOT);
    expect(forcedFaceDraw.flip.value).toBe(1);
  });
});
