import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { DataTexture, Texture } from "three";

export interface CharacterMaterialOptions {
  lightUniforms: LightUniforms;
  pmxMaterial: PmxMaterial;
  rampTexture: DataTexture;
  // The texture the material names, which a material naming none draws without
  texture?: Texture;
}
