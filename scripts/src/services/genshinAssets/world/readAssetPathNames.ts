import { DERIVED_ASSET_PATH_INDEX_PATH } from "#src/services/genshinAssets/world/constants";
import { ensureAssetPathIndex } from "#src/services/genshinAssets/world/ensureAssetPathIndex";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The path of every asset the community index names, by the 64-bit path hash a placement carries in decimal: its
// PathHashPre in the low byte and its PathHashLast in the four bytes above. The derived index, which names the prefabs
// The community's index stops short of, is read after it when it has been built, so a name it gives wins
export const readAssetPathNames = async (): Promise<Map<string, string>> => {
  const pathNames = new Map<string, string>();
  const indexPaths = [await ensureAssetPathIndex()];
  if (existsSync(DERIVED_ASSET_PATH_INDEX_PATH)) indexPaths.push(DERIVED_ASSET_PATH_INDEX_PATH);
  else
    console.warn(
      `${DERIVED_ASSET_PATH_INDEX_PATH} is missing, so the prefabs past 2.6 are named by no path: run \`pnpm -C scripts genshin:assets path-names\` after the capitals are extracted`,
    );
  const indexes = await Promise.all(indexPaths.map((indexPath) => readFile(indexPath, "utf8")));
  for (const index of indexes) {
    const { SubAssets } = parseMachineJson<{
      SubAssets: Record<string, { Name: string; PathHashLast: number; PathHashPre: number }[]>;
    }>(index);
    for (const assets of Object.values(SubAssets))
      for (const { Name, PathHashLast, PathHashPre } of assets)
        pathNames.set(String((BigInt(PathHashLast) << 8n) | BigInt(PathHashPre)), Name);
  }
  return pathNames;
};
