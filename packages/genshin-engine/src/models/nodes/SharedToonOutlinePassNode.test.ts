/* oxlint-disable no-underscore-dangle -- the test reads the outline hook three names _getOutlineMaterial */
import type { ToonEdge } from "#src/models/nodes/ToonEdge";

import { SharedToonOutlinePassNode } from "#src/models/nodes/SharedToonOutlinePassNode";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { Camera, Scene } from "three";
import { float, vec3, vec4 } from "three/tsl";
import { MeshToonNodeMaterial } from "three/webgpu";
import { describe, expect, test } from "vitest";

describe(SharedToonOutlinePassNode, () => {
  test("gives every toon material the same outline material", () => {
    expect.hasAssertions();

    const pass = new SharedToonOutlinePassNode(new Scene(), new Camera(), vec3(0, 0, 0), float(0.01), float(1));
    const outlineMaterial = pass._getOutlineMaterial(new MeshToonNodeMaterial());

    expect(pass._getOutlineMaterial(new MeshToonNodeMaterial())).toBe(outlineMaterial);
  });

  test("shares an edge's outline material only between materials reading the same per-pixel colour", () => {
    expect.hasAssertions();

    const pass = new SharedToonOutlinePassNode(new Scene(), new Camera(), vec3(0, 0, 0), float(0.01), float(1));
    const widthKnots: ToonEdge["widthKnots"] = { depths: [0, 0, 0], scales: [1, 1, 1] };
    const color = vec4(0, 0, 0, 1);
    const outlineMaterial = pass._getOutlineMaterial(new ToonNodeMaterial({}, true, { color, size: 1, widthKnots }));

    expect(pass._getOutlineMaterial(new ToonNodeMaterial({}, true, { color, size: 1, widthKnots }))).toBe(
      outlineMaterial,
    );
    expect(
      pass._getOutlineMaterial(new ToonNodeMaterial({}, true, { color: vec4(0, 0, 0, 1), size: 1, widthKnots })),
    ).not.toBe(outlineMaterial);
  });
});
