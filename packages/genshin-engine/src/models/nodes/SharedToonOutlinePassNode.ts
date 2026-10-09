import type { Material, NodeFrame, NodeMaterial, Renderer } from "three/webgpu";

import { Mesh } from "three";
import { ToonOutlinePassNode } from "three/webgpu";

// Three keys an outline material by the toon material it outlines and builds each one from scratch, though every one is
// The same: the pass's own thickness, colour and alpha nodes, with nothing of the toon material read. So each toon
// Material met for the first time paid a node build and often a pipeline mid-frame. One material serves them all, built
// Once from the pass's nodes, and an object's skinned, instanced or morphed variant still compiles as its own pipeline
export class SharedToonOutlinePassNode extends ToonOutlinePassNode {
  declare _createMaterial: () => NodeMaterial;
  #isCompiling = false;
  #outlineMaterial: NodeMaterial | undefined;

  override updateBefore(frame: NodeFrame): boolean | undefined {
    // The compile holds each toon mesh in the outline material, which the frame must not draw
    if (this.#isCompiling) return undefined;

    return super.updateBefore(frame);
  }

  // Compiles the scene's pipelines, then the outline's over the same meshes: three's compile ignores the render-object
  // Function the outline sets, so each toon mesh is held in the outline material for the second compile. The pass's own
  // Compile sets its render target and MRT, which fails to build some of the scene's shaders, so the renderer's is used
  override async compileAsync(renderer: Renderer): Promise<void> {
    await renderer.compileAsync(this.scene, this.camera);
    const heldMeshes: [Mesh, Material][] = [];
    this.scene.traverse((object) => {
      if (object instanceof Mesh && !Array.isArray(object.material) && checkIsOutlined(object.material))
        heldMeshes.push([object, object.material]);
    });
    const outlineMaterial = this.#getSharedOutlineMaterial();
    this.#isCompiling = true;
    for (const [mesh] of heldMeshes) mesh.material = outlineMaterial;
    try {
      await renderer.compileAsync(this.scene, this.camera);
    } finally {
      for (const [mesh, material] of heldMeshes) mesh.material = material;
      this.#isCompiling = false;
    }
  }

  // Every toon material is outlined by the one shared material, which three would build once per toon material given
  _getOutlineMaterial(_originalMaterial: Material): NodeMaterial {
    return this.#getSharedOutlineMaterial();
  }

  #getSharedOutlineMaterial(): NodeMaterial {
    this.#outlineMaterial ??= this._createMaterial();

    return this.#outlineMaterial;
  }
}

// The base pass's own test for a material it outlines: a toon material that is not drawn as a wireframe
const checkIsOutlined = (material: Material): boolean => {
  const isToon =
    ("isMeshToonMaterial" in material && material.isMeshToonMaterial === true) ||
    ("isMeshToonNodeMaterial" in material && material.isMeshToonNodeMaterial === true);

  return isToon && "wireframe" in material && material.wireframe === false;
};
