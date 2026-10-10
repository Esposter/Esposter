import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { walkAssetClosure } from "#src/services/genshinAssets/blocks/walkAssetClosure";
import {
  CAB_MAP_PATH,
  EXPORTED_ASSET_TYPES,
  GAME_BLOCKS_DIRECTORY,
  LAYOUT_ASSET_TYPES,
} from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseCabMap } from "#src/services/genshinAssets/shared/parseCabMap";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { toMaterialValues } from "#src/services/genshinAssets/shared/toMaterialValues";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { WORLD_JSON_NAME } from "#src/services/genshinAssets/world/constants";
import { deriveCapitalWorld } from "#src/services/genshinAssets/world/deriveCapitalWorld";
import { exportWorld } from "#src/services/genshinAssets/world/exportWorld";
import { extractWorld } from "#src/services/genshinAssets/world/extractWorld";
import { getWorldRoots } from "#src/services/genshinAssets/world/getWorldRoots";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GROUP_BY_TYPE = ["--group_assets", AnimeStudioGroupType.ByType];
// The resolved objects of the given types, named through the asset index by their block and path ID, each exported
// From its block by its exact name, converted or as the export type given. The index holds no file, so a block and path ID it names more than once, or that
// Several files of the block resolve to, is as unresolved as one it does not name
const exportResolvedAssets = async (
  resolvedObjects: readonly ResolvedObject[],
  types: readonly AssetType[],
  assetsDirectory: string,
  exportType?: AnimeStudioExportType,
): Promise<{ assets: (IndexedAsset & { file: string })[]; unresolved: string[] }> => {
  const keyObjectsMap = Map.groupBy(resolvedObjects, ({ block, pathId }) => toObjectKey(block, pathId));
  const keyIndexedMap = Map.groupBy(
    await readIndexedAssets(
      ({ block, pathId, type }) =>
        types.some((assetType) => assetType === type) && keyObjectsMap.has(toObjectKey(block, pathId)),
    ),
    ({ block, pathId }) => toObjectKey(block, pathId),
  );
  const assets: (IndexedAsset & { file: string })[] = [];
  const unresolved: string[] = [];
  for (const [key, objects] of keyObjectsMap) {
    const files = [...new Set(objects.map(({ file }) => file))];
    const indexed = keyIndexedMap.get(key) ?? [];
    const [file] = files;
    const [asset] = indexed;
    if (file && asset && files.length === 1 && indexed.length === 1) assets.push({ ...asset, file });
    else {
      const { block, pathId } = objects[0] ?? { block: "", pathId: "" };
      const reason =
        indexed.length === 0
          ? `not in the asset index as ${types.join(" or ")}`
          : files.length > 1
            ? "resolved from several files of its block, which the asset index does not tell apart"
            : `named ${indexed.length} times by the asset index`;
      unresolved.push(`path ID ${pathId} of ${files.join(" and ")} in ${block}: ${reason}`);
    }
  }
  for (const [block, blockAssets] of Map.groupBy(assets, (asset) => asset.block)) {
    const names = [...new Set(blockAssets.map(({ name }) => RegExp.escape(name)))];
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      assetsDirectory,
      "--names",
      `^(${names.join("|")})$`,
      "--types",
      ...types,
      ...GROUP_BY_TYPE,
      ...(exportType ? ["--export_type", exportType] : []),
    ]);
  }
  return { assets, unresolved };
};
// One component's closure out of the game's blocks: the layout of each of its roots' and spawned prefabs' blocks dumped
// Per file, then every object its roots reach down their children, the meshes and materials those draw and the textures
// Each material samples, each pointer resolved through its own file's external references and exported from the block
// Holding it by its exact name. Its meshes are OBJ, with every field beside each as JSON (the skin and bind poses an OBJ
// Drops among them), its textures PNG and its materials JSON, grouped by type. Assets no pointer reaches are exported
// By the component's name pattern, and a part of the open world's streams and terrain beside them. What was reached is
// Returned as counts, with every pointer that could not be resolved
export const extractComponent = async (component: DerivedAssetComponent): Promise<string> => {
  const options = DerivedAssetComponentMap[component];
  const { namePattern, roots: componentRoots, spawns = [] } = options;
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
        const { textures: slots } = toMaterialValues(
          parseMachineJson<ExportedMaterial>(await readFile(path, "utf8"), reviveSourcePathId),
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
      runAnimeStudio([
        join(GAME_BLOCKS_DIRECTORY, block),
        directory.assets,
        "--names",
        namePattern,
        "--types",
        ...EXPORTED_ASSET_TYPES,
        ...GROUP_BY_TYPE,
      ]);
  // A set-by-hand world is exported here; a derived one was exported by its derivation, which read the placements from it
  if (options.world) await exportWorld(options.world, directory.world);
  const worldLines = world ? await extractWorld(world, directory) : [];
  const unresolved = [...closure.unresolved, ...drawn.unresolved, ...sharedNames, ...sampled.unresolved];
  return [
    `${closure.objects.length} objects reached from ${roots.length} roots, ${drawn.assets.length} meshes and materials, ${sampled.assets.length} textures`,
    ...(derived?.lines ?? []),
    ...worldLines,
    ...(unresolved.length > 0 ? [`${unresolved.length} unresolved:`, ...unresolved.map((line) => `  ${line}`)] : []),
  ].join("\n");
};
