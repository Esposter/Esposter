import { ASSET_PATH_INDEX_PATH } from "#src/services/genshinAssets/world/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// The path of every asset the community index names, by the 64-bit path hash a placement carries in decimal: its
// PathHashPre in the low byte and its PathHashLast in the four bytes above
export const readAssetPathNames = async (): Promise<Map<string, string>> => {
  const { SubAssets } = parseMachineJson<{
    SubAssets: Record<string, { Name: string; PathHashLast: number; PathHashPre: number }[]>;
  }>(await readFile(ASSET_PATH_INDEX_PATH, "utf8"));
  const pathNames = new Map<string, string>();
  for (const assets of Object.values(SubAssets))
    for (const { Name, PathHashLast, PathHashPre } of assets)
      pathNames.set(String((BigInt(PathHashLast) << 8n) | BigInt(PathHashPre)), Name);
  return pathNames;
};
