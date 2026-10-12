import type { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import type { Vector3Tuple, Vector4Tuple } from "three";

// A PMX material: its colours, how many of the model's triangle indices it draws after those of the materials before it,
// which faces it draws and whether its edge is outlined, and the textures it names by their index in the model's list,
// -1 for none. Its toon ramp is one of the model's textures, or one of MMD's ten shared ramps, toon01 to toon10, which
// the world draws from its own ramps. Its edge is the outline's colour and size, its specularity the highlight's exponent
export interface PmxMaterial {
  ambientColor: Vector3Tuple;
  diffuseColor: Vector4Tuple;
  edgeColor: Vector4Tuple;
  edgeSize: number;
  indexCount: number;
  isDoubleSided: boolean;
  isOutlined: boolean;
  isToonShared: boolean;
  name: string;
  specularColor: Vector3Tuple;
  specularity: number;
  sphereMode: PmxSphereMode;
  sphereTextureIndex: number;
  textureIndex: number;
  toonIndex: number;
}
