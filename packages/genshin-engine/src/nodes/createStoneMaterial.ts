import type { StoneMaterialOptions } from "#src/nodes/StoneMaterialOptions";
import type { Node } from "three/webgpu";

import { Color } from "three";
import { color, float, normalView, positionViewDirection, vec3 } from "three/tsl";
import { MeshPhysicalNodeMaterial } from "three/webgpu";

// A stone lit physically, as the game's stone shader lights its towers, bridges, walkway and door: its albedo, a
// Roughness from its smoothness, no metal, its highlights tinted by its specular colour, and a glow along its edges, a
// Fresnel term raised to its power at its strength, in its own colour. Unlike the toon material it steps no light and
// Draws no outline, as the game's stone draws none. A light of the stone's own, such as a door opening, adds to its glow
export const createStoneMaterial = (
  { albedo, rimColor, rimPower, rimStrength, smoothness, specularColor }: StoneMaterialOptions,
  glowNode: Node<"vec3"> = vec3(0),
): MeshPhysicalNodeMaterial => {
  const material = new MeshPhysicalNodeMaterial({
    color: new Color(albedo),
    metalness: 0,
    roughness: 1 - smoothness,
    specularColor: new Color().fromArray(specularColor),
    specularIntensity: 1,
  });
  const fresnel = float(1).sub(normalView.dot(positionViewDirection).saturate()).pow(rimPower);
  material.emissiveNode = color(new Color().fromArray(rimColor)).mul(fresnel.mul(rimStrength)).add(glowNode);
  return material;
};
