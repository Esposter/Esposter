import type { AvatarManifest } from "#src/models/avatar/AvatarManifest";
import type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
import type { AvatarMesh } from "#src/models/avatar/AvatarMesh";
import type { AvatarView } from "#src/models/avatar/AvatarView";
import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";
import type { CharacterAvatarFace } from "#src/models/avatar/CharacterAvatarFace";
import type { CharacterMaterialOptions, FaceDraw, PmxMaterial, ToonNodeMaterial } from "genshin-engine";
import type { Texture } from "three";

import { AVATAR_HUMANOID_MMD_NAME_MAP, AVATAR_TEXTURE_SLOTS } from "#src/services/character/avatar/constants";
import { createAvatarShadingInputs } from "#src/services/character/avatar/createAvatarShadingInputs";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CharacterMaterialKind, createCharacterMaterial, OUTLINE_WIDTH_SCALE, PmxSphereMode } from "genshin-engine";
import { Bone, BufferAttribute, BufferGeometry, Group, Skeleton, SkinnedMesh } from "three";

interface AvatarMaterialOptions extends Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture"> {
  // Each texture file the export holds, decoded, by its file name
  textureFileMap: ReadonlyMap<string, Texture>;
}

type AvatarTextureSlot = (typeof AVATAR_TEXTURE_SLOTS)[number]["slot"];

// A material's value by its name, read with the name as a key so the names keep their underscores
const readMaterialValue = <T>(values: Readonly<Record<string, T>>, name: string): T | undefined => values[name];

// A material's kind is its name's suffix in the export: the face and the hair are drawn as their own kinds, the rest as a body
const getMaterialKind = (materialName: string): CharacterMaterialKind => {
  if (materialName.endsWith("Face")) return CharacterMaterialKind.Face;
  if (materialName.endsWith("Hair")) return CharacterMaterialKind.Hair;
  return CharacterMaterialKind.Body;
};

// A material as the builder keeps it: the shaded material, and the face draw of a face, which the frame's light sets
interface AvatarMaterialRecord {
  faceDraw?: FaceDraw;
  material: ToonNodeMaterial;
}

// One of the game's materials, shaded by the game's own inputs. Its PMX side is the plain one the shading reads for what
// The game's values do not give: an opaque body, outlined by the world's own outline, with no sphere map or toon of its own
const createAvatarMaterial = (
  materialName: string,
  avatarMaterial: AvatarMaterial,
  { lightUniforms, rampTexture, textureFileMap }: AvatarMaterialOptions,
  indexCount: number,
): AvatarMaterialRecord => {
  const slotTextureMap = new Map<AvatarTextureSlot, Texture>();
  for (const { slot } of AVATAR_TEXTURE_SLOTS) {
    const file = avatarMaterial.textures[slot];
    const texture = file === undefined ? undefined : textureFileMap.get(file);
    if (texture) slotTextureMap.set(slot, texture);
  }
  // The game's outline is the material's own edge, in its width; its colour is read per pixel from the material's
  // Regions, which the shading inputs carry, so the edge gives only its alpha
  const materialColour = readMaterialValue(avatarMaterial.colors, "_Color") ?? [1, 1, 1, 1];
  const outlineColour = readMaterialValue(avatarMaterial.colors, "_OutlineColor") ?? [0, 0, 0, 1];
  const pmxMaterial: PmxMaterial = {
    ambientColor: [0, 0, 0],
    diffuseColor: [materialColour[0], materialColour[1], materialColour[2], 1],
    edgeColor: outlineColour,
    edgeSize: (readMaterialValue(avatarMaterial.floats, "_OutlineWidth") ?? 0) * OUTLINE_WIDTH_SCALE,
    indexCount,
    isDoubleSided: false,
    isOutlined: true,
    isToonShared: false,
    name: materialName,
    specularColor: [0, 0, 0],
    specularity: 1,
    sphereMode: PmxSphereMode.Disabled,
    sphereTextureIndex: -1,
    textureIndex: -1,
    toonIndex: -1,
  };
  const kind = getMaterialKind(materialName);
  const shadingInputs = createAvatarShadingInputs(avatarMaterial, kind, slotTextureMap);
  return {
    faceDraw: kind === CharacterMaterialKind.Face ? shadingInputs.faceDraw : undefined,
    material: createCharacterMaterial({
      lightUniforms,
      pmxMaterial,
      rampTexture,
      shadingInputs,
      texture: slotTextureMap.get("_MainTex"),
    }),
  };
};

// A mesh's attributes read as views on the binary, each one a typed array over its bytes and not a copy of them
const createAvatarGeometry = (
  { colors, indices, joints, normals, positions, submeshes, tangents, uvs, weights }: AvatarMesh,
  buffer: ArrayBuffer,
): BufferGeometry => {
  const geometry = new BufferGeometry();
  const float32 = ({ length, offset }: AvatarView, itemSize: number) =>
    new BufferAttribute(new Float32Array(buffer, offset, length), itemSize);
  const uint16 = ({ length, offset }: AvatarView, itemSize: number) =>
    new BufferAttribute(new Uint16Array(buffer, offset, length), itemSize);
  geometry.setAttribute("position", float32(positions, 3));
  geometry.setAttribute("normal", float32(normals, 3));
  geometry.setAttribute("tangent", float32(tangents, 4));
  geometry.setAttribute("uv", float32(uvs, 2));
  if (colors.length > 0) geometry.setAttribute("color", float32(colors, 4));
  geometry.setAttribute("skinIndex", uint16(joints, 4));
  geometry.setAttribute("skinWeight", float32(weights, 4));
  geometry.setIndex(
    indices.isUint32
      ? new BufferAttribute(new Uint32Array(buffer, indices.offset, indices.length), 1)
      : uint16(indices, 1),
  );
  for (const [index, { count, start }] of submeshes.entries()) geometry.addGroup(start, count, index);
  return geometry;
};

// The game's model from its manifest and binary: each bone at its rest pose under the one skeleton the meshes share, each
// Mesh skinned to it and each of its materials shaded from the game's values. The humanoid bones take their MMD names, so
// The poser's name map finds them. The first mesh holds the bones, and the rest bind to its bind matrix
export const createCharacterAvatar = (
  { bones, humanoid, materials, meshes }: AvatarManifest,
  buffer: ArrayBuffer,
  textureFileMap: ReadonlyMap<string, Texture>,
  options: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): CharacterAvatar => {
  const boneList = bones.map(({ name, position, rotation, scale }) => {
    const bone = new Bone();
    bone.name = name;
    bone.position.set(...position);
    bone.quaternion.set(...rotation);
    bone.scale.set(...scale);
    return bone;
  });
  for (const [humanoidName, index] of Object.entries(humanoid)) {
    const mmdName = AVATAR_HUMANOID_MMD_NAME_MAP[humanoidName];
    const bone = boneList[index];
    if (mmdName && bone) bone.name = mmdName;
  }
  const rootBones: Bone[] = [];
  for (const [index, { parent }] of bones.entries()) {
    const bone = boneList[index];
    if (!bone) continue;
    if (parent < 0) rootBones.push(bone);
    else boneList[parent]?.add(bone);
  }
  const skeleton = new Skeleton(boneList);
  const characterMaterialNameMaterialMap = new Map<string, AvatarMaterialRecord>();
  const faces: CharacterAvatarFace[] = [];
  const skinnedMeshes = meshes.map((mesh) => {
    const records = mesh.submeshes.map(({ count, material: materialName }) => {
      const cachedRecord = characterMaterialNameMaterialMap.get(materialName);
      if (cachedRecord) return cachedRecord;
      const avatarMaterial = materials[materialName];
      if (!avatarMaterial)
        throw new InvalidOperationError(
          Operation.Read,
          materialName,
          "is drawn by a mesh but the export does not hold it",
        );
      const record = createAvatarMaterial(materialName, avatarMaterial, { ...options, textureFileMap }, count);
      characterMaterialNameMaterialMap.set(materialName, record);
      return record;
    });
    // A face's draw is one per material, shared by every mesh that draws the material, so it is set once from the root of
    // The first mesh that draws it, rather than once per mesh, whose roots would each set it in turn
    const root = boneList[mesh.rootBone];
    for (const draw of new Set(records.map(({ faceDraw }) => faceDraw)))
      if (draw && root && !faces.some((face) => face.draw === draw)) faces.push({ draw, root });
    return new SkinnedMesh(
      createAvatarGeometry(mesh, buffer),
      records.map(({ material }) => material),
    );
  });
  const [firstMesh] = skinnedMeshes;
  const model = new Group();
  if (firstMesh) {
    firstMesh.add(...rootBones);
    firstMesh.bind(skeleton);
    for (const skinnedMesh of skinnedMeshes.slice(1)) skinnedMesh.bind(skeleton, firstMesh.bindMatrix);
  }
  model.add(...skinnedMeshes);
  return { faces, model, skinnedMeshes };
};
