import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { PmxReader } from "#src/models/character/PmxReader";
import type { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import type { Vector4Tuple } from "three";

import { PmxMaterialFlag } from "#src/models/character/PmxMaterialFlag";

// A PMX file's materials. The specular and ambient colours are passed over, since the world's toon ramp and light stand
// In for MMD's lighting, and so are the edge's colour and size, which the outline pass's one ink and width stand in for
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
    // The specular colour and its strength, and the ambient colour
    reader.skip(28);
    const flags = reader.readUint8();
    // The edge's colour and size
    reader.skip(20);
    const textureIndex = reader.readTextureIndex();
    const sphereTextureIndex = reader.readTextureIndex();
    const sphereMode: PmxSphereMode = reader.readUint8();
    // A shared toon ramp is named by a byte, one of the model's textures by an index
    const isToonShared = Boolean(reader.readUint8());
    const toonIndex = isToonShared ? reader.readUint8() : reader.readTextureIndex();
    // The material's memo
    reader.readText();
    const indexCount = reader.readInt32();
    return {
      diffuseColor,
      indexCount,
      isDoubleSided: Boolean(flags & PmxMaterialFlag.DoubleSided),
      isOutlined: Boolean(flags & PmxMaterialFlag.Outlined),
      isToonShared,
      name,
      sphereMode,
      sphereTextureIndex,
      textureIndex,
      toonIndex,
    };
  });
