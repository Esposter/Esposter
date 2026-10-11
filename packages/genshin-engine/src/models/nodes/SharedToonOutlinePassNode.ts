import type { Material, NodeFrame, NodeMaterial, Renderer } from "three/webgpu";

import { ToonOutlinePassNode } from "three/webgpu";

// Three keys an outline material by the toon material it outlines and builds each one from scratch, though every one is
// The same: the pass's own thickness, colour and alpha nodes, with nothing of the toon material read. So each toon
// Material met for the first time paid a node build and often a pipeline mid-frame. One material serves them all, built
// Once from the pass's nodes, and an object's skinned, instanced or morphed variant still compiles as its own pipeline
export class SharedToonOutlinePassNode extends ToonOutlinePassNode {
  declare _createMaterial: () => NodeMaterial;
  // One frame's draw answers every compile asked for before it
  #drawn?: PromiseWithResolvers<void>;
  #outlineMaterial?: NodeMaterial;

  // Every toon material is outlined by the one shared material, which three would build once per toon material given
  _getOutlineMaterial(_originalMaterial: Material): NodeMaterial {
    return this.#getSharedOutlineMaterial();
  }

  // Waits for the next frame to draw the view, then for the GPU to finish it: each node material, program and pipeline the
  // View shows is then built where the frame draws it, so the frame that first shows it builds none. What the view does
  // Not show builds as it is first drawn. Three's own compile cannot stand in: it keys what it builds by a render's
  // Nesting, which it always takes as the outermost, and builds after its first await, by when the renderer's MRT a
  // Frame set is no longer the pass's
  override async compileAsync(renderer: Renderer): Promise<void> {
    this.#drawn ??= Promise.withResolvers<void>();
    await this.#drawn.promise;
    // A WebGL fallback has no device, and three compiles its programs as it draws them
    const { backend } = renderer;
    if ("device" in backend && backend.device instanceof GPUDevice) await backend.device.queue.onSubmittedWorkDone();
  }

  // The frame's own draw, which answers every compile waiting on it
  override updateBefore(frame: NodeFrame): boolean | undefined {
    super.updateBefore(frame);
    this.#drawn?.resolve();
    this.#drawn = undefined;
    return undefined;
  }

  #getSharedOutlineMaterial(): NodeMaterial {
    // Three's own hook for building the outline material, which this pass answers once for every toon material
    // oxlint-disable-next-line no-underscore-dangle -- three names its build hook _createMaterial
    this.#outlineMaterial ??= this._createMaterial();

    return this.#outlineMaterial;
  }
}
