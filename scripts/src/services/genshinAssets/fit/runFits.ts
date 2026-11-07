import type { RunFitEntry } from "#src/models/genshinAssets/fit/RunFitEntry";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { checkIsSelectedBy } from "#src/services/genshinAssets/fit/checkIsSelectedBy";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's fits, each named, in the order they run. Each returns its report and the records it fits under their keys.
// Every fit that is not opt-in runs, or only those named, so one fit's change is published without every other record refitted, one after
// The other. A name no fit has is an error. Each fit is handed the run's options, so a dry run reaches every fit that
// Writes a world data file. An opt-in fit is left out of a run that names none, since it reads an export the install must
// Make first: it runs only when it is named, and a named run that finds no export fails with its own message
export const runFits = async (
  fits: readonly RunFitEntry[],
  only: readonly string[],
  options: DryRunOptions,
): Promise<GameDataBuild> => {
  const names = fits.map(([name]) => name);
  const unknown = only.find((selected) => !names.some((name) => checkIsSelectedBy(name, selected)));
  if (unknown !== undefined)
    throw new InvalidOperationError(Operation.Read, unknown, `not a fit: one of ${names.join(", ")}`);
  const builds: GameDataBuild[] = [];
  for (const [name, fit, fitOptions] of fits) {
    const isSelected =
      only.length > 0 ? only.some((selected) => checkIsSelectedBy(name, selected)) : fitOptions?.isOptIn !== true;
    if (!isSelected) continue;
    // oxlint-disable-next-line no-await-in-loop -- one fit at a time: a fit's compute holds the thread, so a record another fit fetched meanwhile would outwait its timeout
    builds.push(await fit(options));
  }
  return mergeGameDataBuilds(builds);
};
