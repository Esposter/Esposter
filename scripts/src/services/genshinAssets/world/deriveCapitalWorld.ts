import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { ComponentDirectory } from "#src/models/genshinAssets/shared/ComponentDirectory";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import {
  ARCHITECTURE_VIEW_METRES,
  STREAM_INDEX_SUFFIX,
  TERRAIN_NAME_PREFIX,
} from "#src/services/genshinAssets/world/constants";
import { exportTerrainTiles } from "#src/services/genshinAssets/world/exportTerrainTiles";
import { exportWorldStreams } from "#src/services/genshinAssets/world/exportWorldStreams";
import { getCityStreamName } from "#src/services/genshinAssets/world/getCityStreamName";
import { getCoveredTiles } from "#src/services/genshinAssets/world/getCoveredTiles";
import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";
import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";
import { getTerrainTileNames } from "#src/services/genshinAssets/world/getTerrainTileNames";
import { getWorldTileName } from "#src/services/genshinAssets/world/getWorldTileName";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { readCapitalCityCode } from "#src/services/genshinAssets/world/readCapitalCityCode";
import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { readDerivedPathNames } from "#src/services/genshinAssets/world/readDerivedPathNames";
import { resolvePrefabRoot } from "#src/services/genshinAssets/world/resolvePrefabRoot";
import { selectCapitalPlacements } from "#src/services/genshinAssets/world/selectCapitalPlacements";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region's open world block derived from its capital the way Windrise's is laid out, with no hand step: the tiles its
// View and its architecture radius cover and its city's own StreamGen blob, all read by path hash, the placements
// Those select (every one in view, and each architecture placement within the radius), each prefab of them rooted at
// The game object its name finds in the blocks that name it or, failing that, in any block dumped for the derivation (a
// Game object's block need not index its own mesh or material), and the 2x2 of terrain tiles its capital stands in.
// Each step reads the game's own data (the asset index, the blobs, the community's path names and the ones the asset
// Index's own names hash to, the dumped layouts), so a region gives only its capital's place. Returns the block with
// The lines that report what did not resolve
export const deriveCapitalWorld = async (
  component: DerivedAssetComponent,
  directory: ComponentDirectory,
  dumpLayouts: (blocks: readonly string[]) => Promise<void>,
): Promise<{ lines: string[]; world: WorldOptions }> => {
  const windriseWorld = DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world;
  if (!windriseWorld) throw new InvalidOperationError(Operation.Read, component, "has no origin to stand round");
  const place = await readCapitalWorldPlace(component);
  const lines: string[] = [];
  // Each covered tile's blob and index, then the capital's own city blob and index, by the names their path hash and
  // Index name give. The city blob holds the props and buildings the tiles do not
  const tileNames = getCoveredTiles(place, ARCHITECTURE_VIEW_METRES).map(({ column, row }) =>
    getWorldTileName(column, row),
  );
  const cityCode = await readCapitalCityCode(component);
  if (!cityCode) lines.push(`no city area within ${ARCHITECTURE_VIEW_METRES} metres of the capital`);
  const streamNames = cityCode ? [...tileNames, getCityStreamName(cityCode)] : tileNames;
  const streamAssetNames = new Set(
    streamNames.flatMap((streamName) => [getStreamBlobName(streamName), `${streamName}${STREAM_INDEX_SUFFIX}`]),
  );
  const streamAssets = await readIndexedAssets(({ name }) => streamAssetNames.has(name));
  const streams: WorldOptions["streams"] = [];
  for (const streamName of streamNames) {
    const blobName = getStreamBlobName(streamName);
    const indexName = `${streamName}${STREAM_INDEX_SUFFIX}`;
    const blob = streamAssets.find(({ name, type }) => name === blobName && type === AssetType.MiHoYoBinData);
    const index = streamAssets.find(({ name, type }) => name === indexName && type === AssetType.MonoBehaviour);
    if (blob && index) streams.push({ blob, index, prefabs: [] });
    else lines.push(`${streamName}: no stream in the asset index`);
  }
  exportWorldStreams(streams, directory.world);
  // Each stream's placements, read from the blobs the export just wrote, and the names every prefab they draw is given
  const streamPlacements = await Promise.all(
    streams.map(async ({ blob, index }) => {
      const [blobBytes, indexBytes] = await Promise.all([
        readFile(join(directory.world, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
        readFile(join(directory.world, AssetType.MonoBehaviour, `${index.name}.dat`)),
      ]);
      return parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes));
    }),
  );
  // Each path hash the community's index leaves unnamed is named in the same run by hashing the asset index's own
  // Prefab names, so no step after the extraction is owed before its prefabs are named
  const pathNames = await readAssetPathNames();
  const unnamedKeys = new Set(
    streamPlacements
      .flat()
      .flatMap(({ pathHash }) => (pathHash ? [getPathHashKey(pathHash)] : []))
      .filter((key) => !pathNames.has(key)),
  );
  const derivedPathNames = await readDerivedPathNames(unnamedKeys);
  for (const [key, path] of derivedPathNames) pathNames.set(key, path);
  lines.push(
    `${derivedPathNames.size} of ${unnamedKeys.size} path hashes past the community's index named by their folders`,
  );
  const streamPrefabNames = getPrefabNames(streamPlacements.flat(), pathNames);
  // A prefab no path names is left out of the world, so it is counted here, with the placements it draws in the view
  const unnamedPlacements = streamPlacements.flat().filter(({ prefabId }) => !streamPrefabNames.has(prefabId));
  const unnamedPrefabIds = new Set(unnamedPlacements.map(({ prefabId }) => prefabId));
  const unhashedCount = unnamedPlacements.filter(({ pathHash }) => !pathHash).length;
  lines.push(
    `${unnamedPrefabIds.size} prefabs named by no path (${unnamedPlacements.length} placements, ${unhashedCount} with no path hash): ${[...unnamedPrefabIds].join(", ")}`,
  );
  // The placements the capital keeps, and the prefabs of those alone are rooted
  const viewPlacements = streamPlacements.map((placements) =>
    selectCapitalPlacements(placements, streamPrefabNames, place),
  );
  const prefabNames = getPrefabNames(viewPlacements.flat(), pathNames);
  // The blocks that index each prefab's name, dumped so the game objects of that name can be found in them
  const nameBlocksMap = new Map<string, string[]>();
  const indexedNames = new Set(prefabNames.values());
  for (const { block, name: indexedName } of await readIndexedAssets(({ name }) => indexedNames.has(name))) {
    const blocks = nameBlocksMap.get(indexedName) ?? [];
    if (!blocks.includes(block)) blocks.push(block);
    nameBlocksMap.set(indexedName, blocks);
  }
  const dumpedBlocks = [...new Set([...nameBlocksMap.values()].flat())];
  await dumpLayouts(dumpedBlocks);
  const { objects } = await readSceneLayout(directory.layout);
  const prefabIdRootMap = new Map<number, AssetRoot>();
  const unrootedNames = new Set<string>();
  for (const [prefabId, name] of prefabNames) {
    // A name's game object is looked for in the blocks indexing it first, then in every dumped block, since the index may
    // Name a prefab's mesh or material in a block its game object does not stand in
    const indexedRoot = resolvePrefabRoot(name, nameBlocksMap.get(name) ?? [], objects);
    const root = indexedRoot ?? resolvePrefabRoot(name, dumpedBlocks, objects);
    if (root) prefabIdRootMap.set(prefabId, root);
    else unrootedNames.add(name);
  }
  const streamsWithPrefabs = streams.map(({ blob, index }, streamIndex) => ({
    blob,
    index,
    prefabs: [...new Set(viewPlacements[streamIndex]?.map(({ prefabId }) => prefabId))].flatMap((prefabId) => {
      const prefab = prefabIdRootMap.get(prefabId);
      return prefab ? [{ prefab, prefabId }] : [];
    }),
  }));
  // The 2x2 of terrain tiles from the capital's own tile, each TerrainData found in the blocks naming a terrain tile
  const capitalTile = { column: Math.floor(place.x / TERRAIN_TILE_SIZE), row: Math.floor(place.z / TERRAIN_TILE_SIZE) };
  const terrainNames = getTerrainTileNames(capitalTile);
  const terrainAssets = await readIndexedAssets(({ name }) => name.startsWith(TERRAIN_NAME_PREFIX));
  // The blocks holding a tile's own textures are searched first, since a tile is often exported beside them, then every
  // Other terrain block, since the index names no TerrainData: a tile in none of them is reported
  const nearTerrainBlocks = terrainAssets
    .filter(({ name }) => terrainNames.some((terrainName) => name.startsWith(`${terrainName}_`)))
    .map(({ block }) => block);
  const terrainBlocks = [...new Set([...nearTerrainBlocks, ...terrainAssets.map(({ block }) => block)])];
  const terrainFound = await exportTerrainTiles(terrainNames, terrainBlocks, directory.world);
  const terrainTiles = terrainNames.flatMap((name) => {
    const block = terrainFound.get(name);
    if (block) return [{ block, name }];
    lines.push(`terrain ${name}: in no block of the asset index`);
    return [];
  });
  const placementCount = viewPlacements.reduce((count, placements) => count + placements.length, 0);
  lines.unshift(
    `${streamsWithPrefabs.length} streams, ${placementCount} placements selected`,
    `${prefabIdRootMap.size} of ${prefabNames.size} named prefabs rooted${unrootedNames.size > 0 ? `, unrooted: ${[...unrootedNames].join(", ")}` : ""}`,
  );
  return {
    lines,
    world: { origin: windriseWorld.origin, points: [], regionLandmarks: [], streams: streamsWithPrefabs, terrainTiles },
  };
};
