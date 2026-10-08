import type { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import type { Vector4Tuple } from "three";

// A PMX material: its diffuse colour and opacity, how many of the model's triangle indices it draws after those of the
// Materials before it, which faces it draws and whether its edge is outlined, and the textures it names by their index
// In the model's list, -1 for none. Its toon ramp is one of the model's textures, or one of MMD's ten shared ramps
export interface PmxMaterial {
  diffuseColor: Vector4Tuple;
  indexCount: number;
  isDoubleSided: boolean;
  isOutlined: boolean;
  isToonShared: boolean;
  name: string;
  sphereMode: PmxSphereMode;
  sphereTextureIndex: number;
  textureIndex: number;
  toonIndex: number;
}
