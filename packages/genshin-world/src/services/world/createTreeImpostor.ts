import type { TreeImpostor } from "#src/models/world/TreeImpostor";
import type { LightUniforms } from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";
import type { Renderer } from "three/webgpu";

import { bakeTreeImpostor } from "#src/services/world/bakeTreeImpostor";
import { createImpostorMaterial, createObjectFadeNode } from "genshin-engine";
import { PlaneGeometry } from "three";

// A species' impostor baked from one tree's meshes in its bark's and leaves' colours, on a card standing from the
// Tree's foot to its top, in a material that fades each card in by its own mesh's fade, so every tree of the species
// Draws the one bake in the one material
export const createTreeImpostor = (
  renderer: Renderer,
  branchGeometry: BufferGeometry,
  leafGeometry: BufferGeometry,
  barkColor: string,
  leafColor: string,
  lightUniforms: LightUniforms,
  rampTexture: DataTexture,
): TreeImpostor => {
  const impostor = bakeTreeImpostor(renderer, branchGeometry, leafGeometry, barkColor, leafColor);
  const { bottom, height, width } = impostor;
  return {
    geometry: new PlaneGeometry(width, height).translate(0, bottom + height / 2, 0),
    impostor,
    material: createImpostorMaterial({ fade: createObjectFadeNode(), impostor, lightUniforms, rampTexture }),
  };
};
