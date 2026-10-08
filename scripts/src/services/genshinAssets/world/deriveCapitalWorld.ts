import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { ComponentDirectory } from "#src/models/genshinAssets/shared/ComponentDirectory";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GroundPoint } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { TERRAIN_TILE_SIZE, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import {
  CAPITAL_VIEW_METRES,
  STREAM_INDEX_SUFFIX,
  TERRAIN_NAME_PREFIX,
} from "#src/services/genshinAssets/world/constants";
import { exportTerrainTiles } from "#src/services/genshinAssets/world/exportTerrainTiles";
import { exportWorldStreams } from "#src/services/genshinAssets/world/exportWorldStreams";
import { getCoveredTiles } from "#src/services/genshinAssets/world/getCoveredTiles";
import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";
import { getTerrainTileNames } from "#src/services/genshinAssets/world/getTerrainTileNames";
import { getWorldTileName } from "#src/services/genshinAssets/world/getWorldTileName";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { resolvePrefabRoot } from "#src/services/genshinAssets/world/resolvePrefabRoot";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region's own data as its file holds it: the landmarks its capital is among
interface RegionData {
  landmarks: { id: string; position: GroundPoint }[];
}
// Whether a placement stands within the square a capital is viewed across, round its place in the game's axes
const checkIsInView = ({ position: [x, , z] }: WorldPlacement, { x: centerX, z: centerZ }: GroundPoint): boolean =>
  Math.abs(x - centerX) <= CAPITAL_VIEW_METRES && Math.abs(z - centerZ) <= CAPITAL_VIEW_METRES;
// A region's open world block derived from its capital the way Windrise's is laid out, with no hand step: the tiles its
// View covers and their StreamGen blobs by path hash, the placements in view, each prefab of them rooted at the game
// Object its name finds in the blocks that name it or, failing that, in any block dumped for the derivation (a game
// Object's block need not index its own mesh or material), and the 2x2 of terrain tiles its capital stands in. Each
// Step reads the game's own data (the asset index, the blobs, the community's path names, the dumped layouts), so a
// Region gives only its capital's place. Returns the block with the lines that report what did not resolve
export const deriveCapitalWorld = async (
  component: DerivedAssetComponent,
  directory: ComponentDirectory,
  dumpLayouts: (blocks: readonly string[]) => Promise<void>,
): Promise<{ lines: string[]; world: WorldOptions }> => {
  const capital = RegionCapitalMap[component];
  if (!capital) throw new InvalidOperationError(Operation.Read, component, "has no capital in the region capital map");
  const regionData = parseMachineJson<RegionData>(
    await readFile(join(WORLD_DATA_DIRECTORY, "regions", `${component}.json`), "utf8"),
  );
  const landmark = regionData.landmarks.find(({ id }) => id === capital.landmarkId);
  if (!landmark) throw new InvalidOperationError(Operation.Read, component, `has no landmark ${capital.landmarkId}`);
  const windriseWorld = DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world;
  if (!windriseWorld) throw new InvalidOperationError(Operation.Read, component, "has no origin to stand round");
  const origin = await readWorldOrigin(component);
  const place = toCapitalWorldPlace(landmark.position, origin);
  const lines: string[] = [];
  // Each covered tile's blob and index, by the names its path hash and index name give
  const tileNames = getCoveredTiles(place, CAPITAL_VIEW_METRES).map(({ column, row }) => getWorldTileName(column, row));
  const streamNames = new Set(
    tileNames.flatMap((tileName) => [getStreamBlobName(tileName), `${tileName}${STREAM_INDEX_SUFFIX}`]),
  );
  const streamAssets = await readIndexedAssets(({ name }) => streamNames.has(name));
  const streams: WorldOptions["streams"] = [];
  for (const tileName of tileNames) {
    const blobName = getStreamBlobName(tileName);
    const indexName = `${tileName}${STREAM_INDEX_SUFFIX}`;
    const blob = streamAssets.find(({ name, type }) => name === blobName && type === AssetType.MiHoYoBinData);
    const index = streamAssets.find(({ name, type }) => name === indexName && type === AssetType.MonoBehaviour);
    if (blob && index) streams.push({ blob, index, prefabs: [] });
    else lines.push(`${tileName}: no stream in the asset index`);
  }
  exportWorldStreams(streams, directory.world);
  // The placements in view of each stream, read from the blobs the export just wrote
  const viewPlacements = await Promise.all(
    streams.map(async ({ blob, index }) => {
      const [blobBytes, indexBytes] = await Promise.all([
        readFile(join(directory.world, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
        readFile(join(directory.world, AssetType.MonoBehaviour, `${index.name}.dat`)),
      ]);
      return parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes)).filter((placement) =>
        checkIsInView(placement, place),
      );
    }),
  );
  const prefabNames = getPrefabNames(viewPlacements.flat(), await readAssetPathNames());
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
    `${streamsWithPrefabs.length} streams, ${placementCount} placements in view`,
    `${prefabIdRootMap.size} of ${prefabNames.size} named prefabs rooted${unrootedNames.size > 0 ? `, unrooted: ${[...unrootedNames].join(", ")}` : ""}`,
  );
  return {
    lines,
    world: { origin: windriseWorld.origin, points: [], regionLandmarks: [], streams: streamsWithPrefabs, terrainTiles },
  };
};
