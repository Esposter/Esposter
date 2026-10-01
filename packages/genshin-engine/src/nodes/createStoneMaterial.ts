import type { StoneMaterialOptions } from "#src/nodes/StoneMaterialOptions";

import { Color } from "three";
import { float, normalView, positionViewDirection, vec3 } from "three/tsl";
import { MeshPhysicalNodeMaterial } from "three/webgpu";

// A stone lit physically, as the game's stone shader lights its towers, bridges, walkway and door: its albedo, a
// Roughness from its smoothness, no metal, its highlights tinted by its specular colour, and a glow along its edges, a
// Fresnel term raised to its power at its strength, in its own colour. Unlike the toon material it steps no light and
// Draws no outline, as the game's stone draws none
export const createStoneMaterial = ({
  albedo,
  rimColor,
  rimPower,
  rimStrength,
  smoothness,
  specularColor,
}: StoneMaterialOptions): MeshPhysicalNodeMaterial => {
  const material = new MeshPhysicalNodeMaterial({
    color: new Color(albedo),
    metalness: 0,
    roughness: 1 - smoothness,
    specularColor: new Color(...specularColor),
    specularIntensity: 1,
  });
  const fresnel = float(1).sub(normalView.dot(positionViewDirection).saturate()).pow(rimPower);
  material.emissiveNode = vec3(...rimColor).mul(fresnel.mul(rimStrength));
  return material;
};
