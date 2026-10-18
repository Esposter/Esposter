import type { ToonEdge } from "#src/models/nodes/ToonEdge";
import type { Material, Node, NodeFrame, NodeMaterial, Renderer } from "three/webgpu";

import { createOutlineScaleNode } from "#src/character/shading/createOutlineScaleNode";
import { createGameOutlineMaterial, createOutlineMaterial } from "#src/models/nodes/createOutlineMaterial";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { float, vec4, vertexColor } from "three/tsl";
import { ToonOutlinePassNode } from "three/webgpu";

// Three keys an outline material by the toon material it outlines and builds each one from scratch, though every one is
// The same: the pass's own thickness, colour and alpha nodes, with nothing of the toon material read. So each toon
// Material met for the first time paid a node build and often a pipeline mid-frame. One material serves them all, built
// Once from the pass's nodes, and an object's skinned, instanced or morphed variant still compiles as its own pipeline.
// A material with its own edge is outlined by one material per distinct edge, built once and shared the same way, save
// A game model's colour read per pixel: it samples its own material's textures, so its outline material is that
// Colour's alone, and is dropped with it
export class SharedToonOutlinePassNode extends ToonOutlinePassNode {
  declare alphaNode: Node<"float">;
  // The pass's nodes, which three types untyped, as the outline materials built from them read them
  declare colorNode: Node<"vec3">;
  declare thicknessNode: Node<"float">;
  // One frame's draw answers every compile asked for before it
  #drawn?: PromiseWithResolvers<void>;
  readonly #edgeOutlineMaterials = new Map<string, NodeMaterial>();
  #outlineMaterial?: NodeMaterial;
  readonly #instancedOutlineMaterials = new WeakMap<Node<"mat4">, NodeMaterial>();
  readonly #pixelEdgeOutlineMaterials = new WeakMap<Node<"vec4">, Map<string, NodeMaterial>>();

  // A placed copy is outlined through the matrix its fill reads, a material with its own edge in that edge, and every other
  // Toon material by the one shared material
  _getOutlineMaterial(originalMaterial: Material): NodeMaterial {
    if (originalMaterial instanceof ToonNodeMaterial) {
      if (originalMaterial.instanceMatrix) return this.#getInstancedOutlineMaterial(originalMaterial.instanceMatrix);
      if (originalMaterial.edge) return this.#getEdgeOutlineMaterial(originalMaterial.edge);
    }
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

  // The game's offset is the size, scaled by the vertex's blue less a half where the block-B flag is below a half, and by
  // One where it is not, as the program's form reads it. This is the TSL form of getGameOutlineOffset, the rule's reference,
  // And the two hold one rule
  #createGameOffsetNode(offset: ToonEdge["offset"]): Node<"float"> {
    if (offset === undefined) return float(0);
    const scale = offset.blockBChannel < 0.5 ? vertexColor().b.sub(0.5) : float(1);
    return float(offset.size).mul(scale);
  }

  #getEdgeOutlineMaterial({ color, isVertexWeighted, offset, size, widthKnots }: ToonEdge): NodeMaterial {
    const shapeKey = `${size}:${widthKnots.depths.join(",")}:${widthKnots.scales.join(",")}:${isVertexWeighted}:${offset?.size}:${offset?.blockBChannel}`;
    let edgeOutlineMaterials = this.#edgeOutlineMaterials;
    let key = shapeKey;
    if (Array.isArray(color)) key = `${color.join(",")}:${shapeKey}`;
    else {
      edgeOutlineMaterials = this.#pixelEdgeOutlineMaterials.get(color) ?? new Map<string, NodeMaterial>();
      this.#pixelEdgeOutlineMaterials.set(color, edgeOutlineMaterials);
    }
    let edgeOutlineMaterial = edgeOutlineMaterials.get(key);
    if (edgeOutlineMaterial === undefined) {
      const scale = createOutlineScaleNode(widthKnots.depths, widthKnots.scales);
      const edgeColour = Array.isArray(color) ? vec4(...color) : color;
      // A game edge is pushed as the game's program pushes it: its own width, weighted by the vertex colour's alpha, and
      // Its offset along the ray from the vertex's blue, which the program reads per vertex
      edgeOutlineMaterial = isVertexWeighted
        ? createGameOutlineMaterial(
            edgeColour,
            float(size).mul(scale).mul(vertexColor().a),
            this.#createGameOffsetNode(offset),
          )
        : createOutlineMaterial(edgeColour, this.thicknessNode.mul(float(size)).mul(scale));
      edgeOutlineMaterials.set(key, edgeOutlineMaterial);
    }
    return edgeOutlineMaterial;
  }

  // One outline material per matrix, which every copy the matrix places shares: it reads the very node its fill reads, so the
  // Outline and the fill take their place from one read
  #getInstancedOutlineMaterial(instanceMatrix: Node<"mat4">): NodeMaterial {
    let instancedOutlineMaterial = this.#instancedOutlineMaterials.get(instanceMatrix);
    if (instancedOutlineMaterial === undefined) {
      instancedOutlineMaterial = createOutlineMaterial(
        vec4(this.colorNode, this.alphaNode),
        this.thicknessNode,
        instanceMatrix,
      );
      this.#instancedOutlineMaterials.set(instanceMatrix, instancedOutlineMaterial);
    }
    return instancedOutlineMaterial;
  }

  #getSharedOutlineMaterial(): NodeMaterial {
    this.#outlineMaterial ??= createOutlineMaterial(vec4(this.colorNode, this.alphaNode), this.thicknessNode);
    return this.#outlineMaterial;
  }
}
