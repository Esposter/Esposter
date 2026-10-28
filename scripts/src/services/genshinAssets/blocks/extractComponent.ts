import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { EXTRACT_PRODUCER_PATHS, GROUP_BY_TYPE } from "#src/services/genshinAssets/blocks/constants";
import { exportResolvedAssets } from "#src/services/genshinAssets/blocks/exportResolvedAssets";
import { walkAssetClosure } from "#src/services/genshinAssets/blocks/walkAssetClosure";
import {
  CAB_MAP_PATH,
  EXPORTED_ASSET_TYPES,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
  LAYOUT_ASSET_TYPES,
} from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { toMaterialTextures } from "#src/services/genshinAssets/shared/toMaterialTextures";
import { getLandmarkMeshes } from "#src/services/genshinAssets/witness/getLandmarkMeshes";
import { WORLD_JSON_NAME } from "#src/services/genshinAssets/world/constants";
import { deriveCapitalWorld } from "#src/services/genshinAssets/world/deriveCapitalWorld";
import { exportWorld } from "#src/services/genshinAssets/world/exportWorld";
import { extractWorld } from "#src/services/genshinAssets/world/extractWorld";
import { getWorldRoots } from "#src/services/genshinAssets/world/getWorldRoots";
import { writeProducerStamp } from "#src/services/producerStamp/writeProducerStamp";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One component's closure out of the game's blocks: the layout of each of its roots' and spawned prefabs' blocks dumped
// Per file, then every object its roots reach down their children, the meshes and materials those draw and the textures
// Each material samples, each pointer resolved through its own file's external references and exported from the block
// Holding it by its exact name. Its meshes are OBJ, with every field beside each as JSON (the skin and bind poses an OBJ
// Drops among them), its textures PNG and its materials JSON, grouped by type. Assets no pointer reaches are exported
// By the component's name pattern, and a part of the open world's streams and terrain beside them. What was reached is
// Returned as counts, with every pointer that could not be resolved
export const extractComponent = async (component: DerivedAssetComponent): Promise<string> => {
  const options = DerivedAssetComponentMap[component];
  const { roots: componentRoots, spawns = [] } = options;
  // A landmark's mesh is exported by its name too, so `pose` finds it where no pointer reaches it
  const landmarkMeshes = getLandmarkMeshes(component);
  const landmarkPattern = landmarkMeshes.length > 0 ? `^(${landmarkMeshes.join("|")})$` : "";
  const namePattern = [options.namePattern, landmarkPattern]
    .filter(Boolean)
    .map((pattern) => `(?:${pattern})`)
    .join("|");
  const directory = getComponentDirectory(component);
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  await Promise.all(
    [directory.assets, directory.layout, directory.world].map((path) => rm(path, { force: true, recursive: true })),
  );
  await Promise.all([directory.layout, directory.world].map((path) => mkdir(path, { recursive: true })));
  // A block's layout is dumped once, however many roots and derived prefabs name it
  const dumpedBlocks = new Set<string>();
  const dumpLayouts = async (blocks: readonly string[]): Promise<void> => {
    for (const block of blocks) {
      if (dumpedBlocks.has(block)) continue;
      dumpedBlocks.add(block);
      // oxlint-disable-next-line no-await-in-loop -- AnimeStudio reads one block at a time
      await exportBlockBySource(block, LAYOUT_ASSET_TYPES, AnimeStudioExportType.Json, directory.layout);
    }
  };
  await dumpLayouts(
    [...componentRoots, ...spawns.map(({ prefab }) => prefab), ...getWorldRoots(options.world)].map(
      ({ block }) => block,
    ),
  );
  // A capital's open world is derived before the closure, since the prefabs it places are roots the closure starts from
  const derived = options.isCapitalWorld
    ? await deriveCapitalWorld(component, directory, dumpLayouts, cabMap)
    : undefined;
  if (derived) await writeFile(join(directory.world, WORLD_JSON_NAME), JSON.stringify(derived.world));
  const world = derived?.world ?? options.world;
  const roots = [...componentRoots, ...spawns.map(({ prefab }) => prefab), ...getWorldRoots(world)];
  const { gameObjectDrawingMap, objects } = await readSceneLayout(directory.layout);
  const closure = walkAssetClosure(objects, gameObjectDrawingMap, roots, cabMap);
  const drawn = await exportResolvedAssets(closure.assets, [AssetType.Mesh, AssetType.Material], directory.assets);
  await exportResolvedAssets(closure.assets, [AssetType.Mesh], directory.assets, AnimeStudioExportType.Json);
  // A material's raw bytes beside its JSON, for the shader keywords the JSON drops
  await exportResolvedAssets(closure.assets, [AssetType.Material], directory.assets, AnimeStudioExportType.Raw);
  const materialDirectory = join(directory.assets, AssetType.Material);
  // A material is exported under its name, so of several sharing one, which the JSON holds and which file its texture
  // Pointers resolve through is unknown
  const nameMaterialsMap = Map.groupBy(
    drawn.assets.filter(({ type }) => type === AssetType.Material),
    ({ name }) => name,
  );
  const sharedNames = [...nameMaterialsMap]
    .filter(([, materials]) => materials.length > 1)
    .map(([name, materials]) => `material ${name}: exported under one name by ${materials.length} materials`);
  const textures = (
    await Promise.all(
      Array.from(nameMaterialsMap, async ([name, [material, ...others]]) => {
        if (!material || others.length > 0) return [];
        const path = join(materialDirectory, `${name}.json`);
        if (!existsSync(path)) return [];
        const slots = toMaterialTextures(
          parseMachineJson<ExportedMaterial>(await readFile(path, "utf8"), reviveSourcePathId).m_SavedProperties
            .m_TexEnvs,
        );
        return Object.values(slots).flatMap((slot) => {
          const resolved = resolveObjectPointer(cabMap, material.file, slot);
          return resolved ? [resolved] : [];
        });
      }),
    )
  ).flat();
  const sampled = await exportResolvedAssets(textures, [AssetType.Texture2D], directory.assets);
  if (namePattern)
    for (const block of await readAssetBlocks(namePattern))
      runAnimeStudio(
        [
          join(INSTALLED_BLOCKS_DIRECTORY, block),
          directory.assets,
          "--names",
          namePattern,
          "--types",
          ...EXPORTED_ASSET_TYPES,
          ...GROUP_BY_TYPE,
        ],
        GENSHIN_ANIMESTUDIO_OPTIONS,
      );
  // A set-by-hand world is exported here; a derived one was exported by its derivation, which read the placements from it
  if (options.world) await exportWorld(options.world, directory.world);
  const worldLines = world ? await extractWorld(world, directory) : [];
  writeProducerStamp(directory.root, EXTRACT_PRODUCER_PATHS);
  const unresolved = [...closure.unresolved, ...drawn.unresolved, ...sharedNames, ...sampled.unresolved];
  return [
    `${closure.objects.length} objects reached from ${roots.length} roots, ${drawn.assets.length} meshes and materials, ${sampled.assets.length} textures`,
    ...(derived?.lines ?? []),
    ...worldLines,
    ...(unresolved.length > 0 ? [`${unresolved.length} unresolved:`, ...unresolved.map((line) => `  ${line}`)] : []),
  ].join("\n");
};
