import type { RosterRenderer } from "#src/models/genshinAssets/avatar/RosterRenderer";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { AvatarManifest } from "genshin-world/sceneExport";

import { buildAvatarMesh } from "#src/services/genshinAssets/avatar/buildAvatarMesh";
import { buildSkeleton } from "#src/services/genshinAssets/avatar/buildSkeleton";
import { AVATAR_SOURCE_MAP } from "#src/services/genshinAssets/avatar/constants";
import { exportRig } from "#src/services/genshinAssets/avatar/exportRig";
import { readAvatarRoster } from "#src/services/genshinAssets/avatar/readAvatarRoster";
import { readDrawableMaterials } from "#src/services/genshinAssets/avatar/readDrawableMaterials";
import { readMeshDumps } from "#src/services/genshinAssets/avatar/readMeshDumps";
import { readNodeOfPath } from "#src/services/genshinAssets/avatar/readNodeOfPath";
import { readRendererBones } from "#src/services/genshinAssets/avatar/readRendererBones";
import { readRendererRootBone } from "#src/services/genshinAssets/avatar/readRendererRootBone";
import { readSkinnedRenderers } from "#src/services/genshinAssets/avatar/readSkinnedRenderers";
import { createAvatarBinary } from "#src/services/genshinAssets/avatar/createAvatarBinary";
import { writeMaterials } from "#src/services/genshinAssets/avatar/writeMaterials";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { CAB_MAP_PATH } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { readObjectNames } from "#src/services/genshinAssets/shared/readObjectNames";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's game model written beside its exports as its avatar: the rig of its Avatar asset, each of its LOD0
// Meshes skinned to that rig, and the values of the materials they draw with. Every pointer is resolved through the CAB
// Its renderer lies in, so a mesh or material another CAB names is read from that CAB. The rig's bones keep their rest
// Pose, and a bone a mesh names that the rig lacks is added under the nearest ancestor the rig has, at the layout's pose
export const writeAvatar = async (component: DerivedAssetComponent): Promise<string> => {
  const source = AVATAR_SOURCE_MAP[component];
  if (!source) throw new InvalidOperationError(Operation.Create, component, "has no game model to write as an avatar");
  const directory = getComponentDirectory(component);
  const rig = await exportRig(source.block, source.name, directory.root);
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  const { objects } = await readComponentLayout(component);
  const objectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const [modelRoot] = DerivedAssetComponentMap[component].roots;
  const rootObjects = objects.filter(
    ({ gameObjectId, name }) => gameObjectId === modelRoot?.pathId && name === modelRoot.name,
  );
  const [rootObject] = rootObjects;
  if (rootObjects.length !== 1 || !rootObject)
    throw new InvalidOperationError(Operation.Read, component, "has no single model root in its layout");
  const gameObjectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.gameObjectId), object]));
  const renderers = await readSkinnedRenderers(directory.layout, cabMap);
  const meshNames = await readObjectNames(
    renderers.flatMap(({ mesh }) => (mesh ? [mesh] : [])),
    cabMap,
  );
  const materialRefs = renderers
    .filter(({ mesh }) => mesh && meshNames.has(toObjectKey(mesh.file, mesh.pathId)))
    .flatMap(({ materials }) => materials.flatMap((material) => (material ? [material] : [])));
  const materialNames = await readObjectNames(materialRefs, cabMap);
  const materialsDirectory = join(directory.root, "avatar-materials");
  const drawableMaterials = await withFinalizerAsync(
    () => readDrawableMaterials(materialRefs, materialNames, cabMap, materialsDirectory),
    () => rm(materialsDirectory, { force: true, recursive: true }),
  );
  const texturedKeys = new Set(
    [...drawableMaterials].filter(([, { textures }]) => "_MainTex" in textures).map(([key]) => key),
  );
  const candidates = renderers.flatMap((skinned): RosterRenderer[] => {
    const { mesh } = skinned;
    const name = mesh ? meshNames.get(toObjectKey(mesh.file, mesh.pathId)) : undefined;
    return mesh && name !== undefined
      ? [
          {
            ...skinned,
            mesh,
            name,
            object: gameObjectMap.get(toObjectKey(skinned.file, skinned.renderer.m_GameObject.m_PathID)),
          },
        ]
      : [];
  });
  const roster = readAvatarRoster(
    candidates,
    toObjectKey(rootObject.file, rootObject.transformId),
    objectMap,
    texturedKeys,
  );
  if (roster.length === 0)
    throw new InvalidOperationError(Operation.Read, source.name, "has no enabled LOD0 renderer under its model root");
  const meshesDirectory = join(directory.root, "avatar-meshes");
  const meshDumps = await withFinalizerAsync(
    () =>
      readMeshDumps(
        roster.map(({ mesh }) => mesh),
        meshNames,
        meshesDirectory,
      ),
    () => rm(meshesDirectory, { force: true, recursive: true }),
  );
  const drawn = roster.map((skinned) => {
    const { mesh, name } = skinned;
    const dump = meshDumps.get(toObjectKey(mesh.file, mesh.pathId));
    if (!dump) throw new InvalidOperationError(Operation.Read, name, "has no mesh dump");
    const rootBone = readRendererRootBone(skinned, objectMap);
    if (!rootBone) throw new InvalidOperationError(Operation.Read, name, "has a root bone outside the rig");
    return {
      bones: readRendererBones(skinned, name, dump, objectMap),
      materials: skinned.materials,
      mesh: dump,
      name,
      rootBone,
    };
  });
  const { nodeOfPath, nodes } = buildSkeleton(rig.nodes, [
    ...drawn.flatMap(({ bones }) => bones),
    ...drawn.map(({ rootBone }) => rootBone),
  ]);
  const materials = await writeMaterials(
    component,
    cabMap,
    materialNames,
    drawableMaterials,
    drawn.flatMap(({ materials: refs, mesh }) =>
      refs.slice(0, mesh.m_SubMeshes.length).flatMap((ref) => (ref ? [ref] : [])),
    ),
  );
  const binary = createAvatarBinary();
  const manifest: AvatarManifest = {
    bones: nodes,
    humanoid: rig.humanoid,
    materials,
    meshes: drawn.map(({ bones, materials: refs, mesh, name, rootBone }) =>
      buildAvatarMesh(
        name,
        mesh,
        bones.map(({ path }) => readNodeOfPath(nodeOfPath, path)),
        refs.map((ref) => (ref ? materialNames.get(toObjectKey(ref.file, ref.pathId)) : undefined) ?? ""),
        readNodeOfPath(nodeOfPath, rootBone.path),
        binary,
      ),
    ),
  };
  await writeFile(join(directory.root, AVATAR_BINARY_FILE_NAME), binary.toBuffer());
  const path = join(directory.root, AVATAR_MANIFEST_FILE_NAME);
  await writeFile(path, JSON.stringify(manifest));
  return path;
};
