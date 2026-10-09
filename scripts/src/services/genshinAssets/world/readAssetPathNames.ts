import { ASSET_PATH_INDEX_PATH, DERIVED_ASSET_PATH_INDEX_PATH } from "#src/services/genshinAssets/world/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The path of every asset the community index names, by the 64-bit path hash a placement carries in decimal: its
// PathHashPre in the low byte and its PathHashLast in the four bytes above. The derived index, which names the prefabs
// The community's index stops short of, is read after it when it has been built, so a name it gives wins
export const readAssetPathNames = async (): Promise<Map<string, string>> => {
  const pathNames = new Map<string, string>();
  const indexPaths = [
    ASSET_PATH_INDEX_PATH,
    ...(existsSync(DERIVED_ASSET_PATH_INDEX_PATH) ? [DERIVED_ASSET_PATH_INDEX_PATH] : []),
  ];
  for (const indexPath of indexPaths) {
    const { SubAssets } = parseMachineJson<{
      SubAssets: Record<string, { Name: string; PathHashLast: number; PathHashPre: number }[]>;
    }>(await readFile(indexPath, "utf8"));
    for (const assets of Object.values(SubAssets))
      for (const { Name, PathHashLast, PathHashPre } of assets)
        pathNames.set(String((BigInt(PathHashLast) << 8n) | BigInt(PathHashPre)), Name);
  }
  return pathNames;
};
