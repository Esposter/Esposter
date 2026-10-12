import type { Vector4Tuple } from "three";

// A material's values as the game's shader reads them: its colours and floats by property name, the keywords it compiles
// Its variant with, and each texture slot's file, relative to the component's assets folder
export interface AvatarMaterial {
  colors: Record<string, Vector4Tuple>;
  floats: Record<string, number>;
  keywords: string[];
  textures: Record<string, string>;
}
