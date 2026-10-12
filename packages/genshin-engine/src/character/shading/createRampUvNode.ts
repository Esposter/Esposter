import type { Node } from "three/webgpu";

import { RampLayout } from "#src/models/character/RampLayout";
import { float, vec2 } from "three/tsl";

// The TSL form of getRampUv: the layout is chosen here at build time, so the node reads one coordinate with no branch
export const createRampUvNode = (layout: RampLayout, column: Node<"float">, row: Node<"float">): Node<"vec2"> =>
  layout === RampLayout.Horizontal ? vec2(column, float(1).sub(row)) : vec2(float(0.5), column);
