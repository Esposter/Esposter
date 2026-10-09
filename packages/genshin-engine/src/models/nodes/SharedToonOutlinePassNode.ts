import type { Object3D } from "three";
import type { Material, NodeFrame, NodeMaterial, Renderer } from "three/webgpu";

import { ToonOutlinePassNode } from "three/webgpu";

// Three keys an outline material by the toon material it outlines and builds each one from scratch, though every one is
// The same: the pass's own thickness, colour and alpha nodes, with nothing of the toon material read. So each toon
// Material met for the first time paid a node build and often a pipeline mid-frame. One material serves them all, built
// Once from the pass's nodes, and an object's skinned, instanced or morphed variant still compiles as its own pipeline
export class SharedToonOutlinePassNode extends ToonOutlinePassNode {
  declare _createMaterial: () => NodeMaterial;
  #onWarmed?: () => void;
  #outlineMaterial?: NodeMaterial;

  // Every toon material is outlined by the one shared material, which three would build once per toon material given
  _getOutlineMaterial(_originalMaterial: Material): NodeMaterial {
    return this.#getSharedOutlineMaterial();
  }

  // Draws every object of the scene once, unseen, on the next frame, then waits for the GPU to finish it: each node
  // Material, program and pipeline is then built where the frame draws it, so nothing the camera turns to or a change of
  // Detail shows builds one mid-frame, and no pipeline the GPU compiles holds the frames after it. Three's own compile
  // Cannot: it keys what it builds by a render's nesting, which it always takes as the outermost, and builds after its
  // First await, by when the renderer's MRT a frame set is no longer the pass's
  override async compileAsync(renderer: Renderer): Promise<void> {
    await new Promise<void>((resolve) => {
      this.#onWarmed = resolve;
    });
    // A WebGL fallback has no device, and three compiles its programs as it draws them
    const { backend } = renderer;
    if ("device" in backend && backend.device instanceof GPUDevice) await backend.device.queue.onSubmittedWorkDone();
  }

  // After the frame's own draw, the warm draw: every object shown and unculled, drawn into a target of the pass's own
  // Attachments, which three renders in the same context, so the frame and the shadow maps it drew are left as they were
  override updateBefore(frame: NodeFrame): boolean | undefined {
    super.updateBefore(frame);
    const onWarmed = this.#onWarmed;
    if (!onWarmed) return undefined;
    const objectStates: [Object3D, boolean, boolean][] = [];
    this.scene.traverse((object) => {
      objectStates.push([object, object.visible, object.frustumCulled]);
      object.visible = true;
      object.frustumCulled = false;
    });
    const { renderTarget } = this;
    const warmRenderTarget = renderTarget.clone();
    this.renderTarget = warmRenderTarget;
    super.updateBefore(frame);
    this.renderTarget = renderTarget;
    warmRenderTarget.dispose();
    for (const [object, isVisible, isFrustumCulled] of objectStates) {
      object.visible = isVisible;
      object.frustumCulled = isFrustumCulled;
    }
    this.#onWarmed = undefined;
    onWarmed();
    return undefined;
  }

  #getSharedOutlineMaterial(): NodeMaterial {
    // Three's own hook for building the outline material, which this pass answers once for every toon material
    // oxlint-disable-next-line no-underscore-dangle -- three names its build hook _createMaterial
    this.#outlineMaterial ??= this._createMaterial();

    return this.#outlineMaterial;
  }
}
