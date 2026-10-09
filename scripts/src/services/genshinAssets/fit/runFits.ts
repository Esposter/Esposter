import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's fits by name, each returning its report and the records it fits under their keys: every fit, or only
// Those named, so one fit's change is published without every other record refitted, one after the other. A name no fit
// Has is an error
export const runFits = async (
  fits: Record<string, () => Promise<GameDataBuild>>,
  only: readonly string[],
): Promise<GameDataBuild> => {
  const unknown = only.find((name) => !(name in fits));
  if (unknown !== undefined)
    throw new InvalidOperationError(Operation.Read, unknown, `not a fit: one of ${Object.keys(fits).join(", ")}`);
  const builds: GameDataBuild[] = [];
  for (const [name, fit] of Object.entries(fits)) {
    if (only.length > 0 && !only.includes(name)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one fit at a time: a fit's compute holds the thread, so a record another fit fetched meanwhile would outwait its timeout
    builds.push(await fit());
  }
  return mergeGameDataBuilds(builds);
};
