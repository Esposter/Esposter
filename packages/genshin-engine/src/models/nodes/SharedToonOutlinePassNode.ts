import type { ToonEdge } from "#src/models/nodes/ToonEdge";
import type { Material, NodeFrame, NodeMaterial, Renderer } from "three/webgpu";

import { createOutlineMaterial } from "#src/models/nodes/createOutlineMaterial";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { float, vec4 } from "three/tsl";
import { ToonOutlinePassNode } from "three/webgpu";

// Three keys an outline material by the toon material it outlines and builds each one from scratch, though every one is
// The same: the pass's own thickness, colour and alpha nodes, with nothing of the toon material read. So each toon
// Material met for the first time paid a node build and often a pipeline mid-frame. One material serves them all, built
// Once from the pass's nodes, and an object's skinned, instanced or morphed variant still compiles as its own pipeline.
// A material with its own edge is outlined by one material per distinct edge, built once and shared the same way
export class SharedToonOutlinePassNode extends ToonOutlinePassNode {
  // One frame's draw answers every compile asked for before it
  #drawn?: PromiseWithResolvers<void>;
  #edgeOutlineMaterials = new Map<string, NodeMaterial>();
  #outlineMaterial?: NodeMaterial;

  // A material with its own edge is outlined in that edge, and every other toon material by the one shared material
  _getOutlineMaterial(originalMaterial: Material): NodeMaterial {
    if (originalMaterial instanceof ToonNodeMaterial && originalMaterial.edge)
      return this.#getEdgeOutlineMaterial(originalMaterial.edge);
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

  #getEdgeOutlineMaterial({ color, size }: ToonEdge): NodeMaterial {
    const key = `${color.join()}:${size}`;
    let edgeOutlineMaterial = this.#edgeOutlineMaterials.get(key);
    if (edgeOutlineMaterial === undefined) {
      const [red, green, blue, alpha] = color;
      edgeOutlineMaterial = createOutlineMaterial(vec4(red, green, blue, alpha), this.thicknessNode.mul(float(size)));
      this.#edgeOutlineMaterials.set(key, edgeOutlineMaterial);
    }
    return edgeOutlineMaterial;
  }

  #getSharedOutlineMaterial(): NodeMaterial {
    this.#outlineMaterial ??= createOutlineMaterial(vec4(this.colorNode, this.alphaNode), this.thicknessNode);
    return this.#outlineMaterial;
  }
}
