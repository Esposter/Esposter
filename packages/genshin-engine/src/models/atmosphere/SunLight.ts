import type { AnchoredCascadeShadowNode } from "#src/models/nodes/AnchoredCascadeShadowNode";
import type { DirectionalLight } from "three";

export interface SunLight {
  cascadedShadowNode: AnchoredCascadeShadowNode;
  light: DirectionalLight;
}
