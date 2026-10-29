import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { checkIsSelectedBy } from "#src/services/genshinAssets/fit/checkIsSelectedBy";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's fits by name, each returning its report and the records it fits under their keys: every fit, or only
// Those named, so one fit's change is published without every other record refitted, one after the other. A name no fit
// Has is an error. Each fit is handed the run's options, so a dry run reaches every fit that writes a world data file
export const runFits = async (
  fits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>>,
  only: readonly string[],
  options: DryRunOptions,
): Promise<GameDataBuild> => {
  const names = Object.keys(fits);
  const unknown = only.find((selected) => !names.some((name) => checkIsSelectedBy(name, selected)));
  if (unknown !== undefined)
    throw new InvalidOperationError(Operation.Read, unknown, `not a fit: one of ${names.join(", ")}`);
  const builds: GameDataBuild[] = [];
  for (const [name, fit] of Object.entries(fits)) {
    if (only.length > 0 && !only.some((selected) => checkIsSelectedBy(name, selected))) continue;
    // oxlint-disable-next-line no-await-in-loop -- one fit at a time: a fit's compute holds the thread, so a record another fit fetched meanwhile would outwait its timeout
    builds.push(await fit(options));
  }
  return mergeGameDataBuilds(builds);
};
