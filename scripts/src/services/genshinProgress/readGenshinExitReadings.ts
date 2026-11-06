import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";

import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { GAME_DATA_KEYS_PATH } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { checkIsDerivedAssetComponent } from "#src/services/genshinAssets/shared/checkIsDerivedAssetComponent";
import { getReportMeans } from "#src/services/genshinParity/fixtures/getReportMeans";
import { getParityPassesPath } from "#src/services/genshinParity/passes/getParityPassesPath";
import { DEFAULT_APPROVAL, PARITY_SCORES_PATH } from "#src/services/genshinParity/reference/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { parseGameDataKeyList } from "#src/services/genshinProgress/parseGameDataKeyList";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// A report's text, empty while the report has not been written
const readReport = (path: string): Promise<string> => (existsSync(path) ? readFile(path, "utf8") : Promise.resolve(""));

// Every reading the exit checks take, each read once off the working tree: the committed scores, every reference's bar, the
// Passes report of each region whose folder names a component, and the lock beside the key list the world reads
export const readGenshinExitReadings = async (areas: readonly GenshinArea[]): Promise<GenshinExitReadings> => {
  const [lock, scoresReport, keyList] = await Promise.all([
    readGameDataLock(),
    readReport(PARITY_SCORES_PATH),
    readFile(GAME_DATA_KEYS_PATH, "utf8"),
  ]);
  const regionComponents = areas
    .filter(({ kind }) => kind === ComputeKind.Region)
    .map(({ folder }) => folder)
    .filter((folder) => checkIsDerivedAssetComponent(folder));
  const passReports = await Promise.all(
    regionComponents.map(async (component) => [component, await readReport(getParityPassesPath(component))] as const),
  );
  return {
    approvals: new Map(
      Object.entries(ParityReferenceMap).map(([id, { approval }]) => [id, approval ?? DEFAULT_APPROVAL] as const),
    ),
    lockKeys: { indexes: Object.keys(lock.indexes), objects: Object.keys(lock.objects) },
    means: getReportMeans(scoresReport),
    passReports: new Map(passReports),
    requiredKeys: parseGameDataKeyList(keyList),
  };
};
