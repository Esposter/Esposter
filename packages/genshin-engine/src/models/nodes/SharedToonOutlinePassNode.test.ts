import type { Material, Renderer } from "three/webgpu";

import { SharedToonOutlinePassNode } from "#src/models/nodes/SharedToonOutlinePassNode";
import { BoxGeometry, Camera, Mesh, Scene } from "three";
import { float, vec3 } from "three/tsl";
import { MeshBasicNodeMaterial, MeshToonNodeMaterial } from "three/webgpu";
import { describe, expect, test } from "vitest";

describe(SharedToonOutlinePassNode, () => {
  test("gives every toon material the same outline material", () => {
    expect.hasAssertions();

    const pass = new SharedToonOutlinePassNode(new Scene(), new Camera(), vec3(0, 0, 0), float(0.01), float(1));
    const outlineMaterial = pass._getOutlineMaterial(new MeshToonNodeMaterial());

    expect(pass._getOutlineMaterial(new MeshToonNodeMaterial())).toBe(outlineMaterial);
  });

  test("compiles a multi-material mesh's toon groups in the outline material, then restores its materials", async () => {
    expect.hasAssertions();

    const scene = new Scene();
    const toonMaterial = new MeshToonNodeMaterial();
    const basicMaterial = new MeshBasicNodeMaterial();
    const materials = [toonMaterial, basicMaterial];
    const mesh = new Mesh(new BoxGeometry(), materials);
    scene.add(mesh);
    const pass = new SharedToonOutlinePassNode(scene, new Camera(), vec3(0, 0, 0), float(0.01), float(1));
    const compiledMaterials: (Material | Material[])[] = [];
    const renderer = {
      compileAsync: () => {
        compiledMaterials.push(mesh.material);
        return Promise.resolve();
      },
    };
    await pass.compileAsync(renderer as unknown as Renderer);

    expect(compiledMaterials[1]).toStrictEqual([pass._getOutlineMaterial(toonMaterial), basicMaterial]);
    expect(mesh.material).toBe(materials);
  });
});
