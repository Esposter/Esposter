import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { DataTexture, Texture } from "three";

export interface CharacterMaterialOptions {
  // Whether the diffuse texture has clear texels, which blends the material as a diffuse alpha below one does
  isTextureTransparent?: boolean;
  lightUniforms: LightUniforms;
  pmxMaterial: PmxMaterial;
  // The world's ramp, which a material whose file names no toon ramp is lit on
  rampTexture: DataTexture;
  // The sphere map the material names, which a material naming none draws without
  sphereTexture?: Texture;
  // The texture the material names, which a material naming none draws without
  texture?: Texture;
  // The toon ramp the model's own texture list names, when the material names one there rather than a shared ramp
  toonTexture?: Texture;
}
