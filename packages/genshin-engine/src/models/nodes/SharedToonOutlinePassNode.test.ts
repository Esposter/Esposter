/* oxlint-disable no-underscore-dangle -- the test reads the outline hook three names _getOutlineMaterial */
import { SharedToonOutlinePassNode } from "#src/models/nodes/SharedToonOutlinePassNode";
import { Camera, Scene } from "three";
import { float, vec3 } from "three/tsl";
import { MeshToonNodeMaterial } from "three/webgpu";
import { describe, expect, test } from "vitest";

describe(SharedToonOutlinePassNode, () => {
  test("gives every toon material the same outline material", () => {
    expect.hasAssertions();

    const pass = new SharedToonOutlinePassNode(new Scene(), new Camera(), vec3(0, 0, 0), float(0.01), float(1));
    const outlineMaterial = pass._getOutlineMaterial(new MeshToonNodeMaterial());

    expect(pass._getOutlineMaterial(new MeshToonNodeMaterial())).toBe(outlineMaterial);
  });
});
