import type { Impostor, ToonNodeMaterial } from "genshin-engine";
import type { PlaneGeometry } from "three";

// A species' impostor as every tree of it draws it: the bake, the card it is drawn on and the one material reading it
export interface TreeImpostor {
  geometry: PlaneGeometry;
  impostor: Impostor;
  material: ToonNodeMaterial;
}
