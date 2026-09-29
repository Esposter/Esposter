import type { DirectionalLight } from "three";
import type { CSMShadowNode } from "three/examples/jsm/csm/CSMShadowNode.js";

export interface SunLight {
  cascadedShadowNode: CSMShadowNode;
  light: DirectionalLight;
}
