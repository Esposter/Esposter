import type { SceneSurfaceDetail } from "#src/models/scene/SceneSurfaceDetail";
import type { SurfaceDetail } from "genshin-engine";
import type { Material } from "three";
import type { Node } from "three/webgpu";

import { SURFACE_DETAIL_KEY } from "#src/services/scene/constants";
import { createMaterialDetail } from "genshin-engine";

// A material's surface detail, its node returned for the colour to multiply by, and its targets and amplitudes tagged on
// The material under the family it draws, so the parity page reads and sets a family's grain on the live scene
export const createSceneSurfaceDetail = (material: Material, family: string, detail: SurfaceDetail): Node<"float"> => {
  const { amplitudes, node } = createMaterialDetail(detail);
  const tag: SceneSurfaceDetail = { amplitudes, detail, family };
  material.userData[SURFACE_DETAIL_KEY] = tag;
  return node;
};
