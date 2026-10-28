import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { PmxReader } from "#src/models/character/PmxReader";
import type { Vector3Tuple, Vector4Tuple } from "three";

import { PmxMaterialFlag } from "#src/models/character/PmxMaterialFlag";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";

const checkIsPmxSphereMode = (value: number): value is PmxSphereMode => value in PmxSphereMode;
// A PMX file's materials, each read in the order the format stores it
export const parsePmxMaterials = (reader: PmxReader): PmxMaterial[] =>
  Array.from({ length: reader.readInt32() }, () => {
    const name = reader.readText();
    reader.readText();
    const diffuseColor: Vector4Tuple = [
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
    ];
    const specularColor: Vector3Tuple = [reader.readFloat32(), reader.readFloat32(), reader.readFloat32()];
    const specularity = reader.readFloat32();
    const ambientColor: Vector3Tuple = [reader.readFloat32(), reader.readFloat32(), reader.readFloat32()];
    const flags = reader.readUint8();
    const edgeColor: Vector4Tuple = [
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
    ];
    const edgeSize = reader.readFloat32();
    const textureIndex = reader.readTextureIndex();
    const sphereTextureIndex = reader.readTextureIndex();
    const sphereMode = reader.readUint8();
    if (!checkIsPmxSphereMode(sphereMode)) throw new RangeError(`Unknown PMX sphere mode ${sphereMode}`);
    // A shared toon ramp is named by a byte, one of the model's textures by an index
    const isToonShared = Boolean(reader.readUint8());
    const toonIndex = isToonShared ? reader.readUint8() : reader.readTextureIndex();
    // The material's memo
    reader.readText();
    const indexCount = reader.readInt32();
    return {
      ambientColor,
      diffuseColor,
      edgeColor,
      edgeSize,
      indexCount,
      isDoubleSided: Boolean(flags & PmxMaterialFlag.DoubleSided),
      isOutlined: Boolean(flags & PmxMaterialFlag.Outlined),
      isToonShared,
      name,
      specularColor,
      specularity,
      sphereMode,
      sphereTextureIndex,
      textureIndex,
      toonIndex,
    };
  });
