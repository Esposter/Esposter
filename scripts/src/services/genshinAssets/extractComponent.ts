import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { ExportedMaterial } from "#src/models/genshinAssets/ExportedMaterial";
import type { IndexedAsset } from "#src/models/genshinAssets/IndexedAsset";
import type { ResolvedObject } from "#src/models/genshinAssets/ResolvedObject";

import { AnimeStudioExportType } from "#src/models/genshinAssets/AnimeStudioExportType";
import {
  CAB_MAP_PATH,
  EXPORTED_ASSET_TYPES,
  GAME_BLOCKS_DIRECTORY,
  LAYOUT_ASSET_TYPES,
} from "#src/services/genshinAssets/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { exportBlockBySource } from "#src/services/genshinAssets/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { parseCabMap } from "#src/services/genshinAssets/parseCabMap";
import { readAssetBlocks } from "#src/services/genshinAssets/readAssetBlocks";
import { readIndexedAssets } from "#src/services/genshinAssets/readIndexedAssets";
import { readMaterialValues } from "#src/services/genshinAssets/readMaterialValues";
import { readSceneLayout } from "#src/services/genshinAssets/readSceneLayout";
import { resolveObjectPointer } from "#src/services/genshinAssets/resolveObjectPointer";
import { reviveSourcePathId } from "#src/services/genshinAssets/reviveSourcePathId";
import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { walkAssetClosure } from "#src/services/genshinAssets/walkAssetClosure";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const GROUP_BY_TYPE = ["--group_assets", "ByType"];
// The resolved objects of the given types, named through the asset index by their block and path ID, each exported
// From its block by its exact name. The index holds no file, so a block and path ID it names more than once, or that
// Several files of the block resolve to, is as unresolved as one it does not name
const exportResolvedAssets = async (
  resolvedObjects: readonly ResolvedObject[],
  types: readonly string[],
  assetsDirectory: string,
): Promise<{ assets: (IndexedAsset & { file: string })[]; unresolved: string[] }> => {
  const keyObjectsMap = Map.groupBy(resolvedObjects, ({ block, pathId }) => toObjectKey(block, pathId));
  const keyIndexedMap = Map.groupBy(
    await readIndexedAssets(
      ({ block, pathId, type }) => types.includes(type) && keyObjectsMap.has(toObjectKey(block, pathId)),
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
    ]);
  }
  return { assets, unresolved };
};
// One component's closure out of the game's blocks: the layout of each of its roots' blocks dumped per file, then every
// Object its roots reach down their children, the meshes and materials those draw and the textures each material
// Samples, each pointer resolved through its own file's external references and exported from the block holding it by
// Its exact name. Its meshes are OBJ, its textures PNG and its materials JSON, grouped by type. Assets no pointer
// Reaches are exported by the component's name pattern. What was reached is returned as counts, with every pointer that
// Could not be resolved
export const extractComponent = async (component: DerivedAssetComponent): Promise<string> => {
  const { namePattern, roots } = DerivedAssetComponentMap[component];
  const directory = getComponentDirectory(component);
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  await Promise.all([directory.assets, directory.layout].map((path) => rm(path, { force: true, recursive: true })));
  await mkdir(directory.layout, { recursive: true });
  for (const rootBlock of new Set(roots.map(({ block }) => block)))
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio reads one block at a time
    await exportBlockBySource(rootBlock, LAYOUT_ASSET_TYPES, AnimeStudioExportType.Json, directory.layout);
  const { gameObjectDrawingMap, objects } = await readSceneLayout(directory.layout);
  const closure = walkAssetClosure(objects, gameObjectDrawingMap, roots, cabMap);
  const drawn = await exportResolvedAssets(closure.assets, ["Mesh", "Material"], directory.assets);
  const materialDirectory = join(directory.assets, "Material");
  // A material is exported under its name, so of several sharing one, which the JSON holds and which file its texture
  // Pointers resolve through is unknown
  const nameMaterialsMap = Map.groupBy(
    drawn.assets.filter(({ type }) => type === "Material"),
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
        const { textures: slots } = readMaterialValues(
          parseMachineJson<ExportedMaterial>(await readFile(path, "utf8"), reviveSourcePathId),
        );
        return Object.values(slots).flatMap((slot) => {
          const resolved = resolveObjectPointer(cabMap, material.file, slot);
          return resolved ? [resolved] : [];
        });
      }),
    )
  ).flat();
  const sampled = await exportResolvedAssets(textures, ["Texture2D"], directory.assets);
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
  const unresolved = [...closure.unresolved, ...drawn.unresolved, ...sharedNames, ...sampled.unresolved];
  return [
    `${closure.objects.length} objects reached from ${roots.length} roots, ${drawn.assets.length} meshes and materials, ${sampled.assets.length} textures`,
    ...(unresolved.length > 0 ? [`${unresolved.length} unresolved:`, ...unresolved.map((line) => `  ${line}`)] : []),
  ].join("\n");
};
