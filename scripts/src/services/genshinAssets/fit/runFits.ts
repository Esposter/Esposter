import type { RunFitEntry } from "#src/models/genshinAssets/fit/RunFitEntry";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { checkIsSelectedBy } from "#src/services/genshinAssets/fit/checkIsSelectedBy";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's fits, each named, in the order they run. Each returns its report and the records it fits under their
// Keys. Every fit that is not opt-in runs, or only those named, so one fit's change is published without every other
// Record refitted, one after The other. A name no fit has is an error. Each fit is handed the run's options, so a dry
// Run reaches every fit that Writes a world data file. An opt-in fit is left out of a run that names none, since it
// Reads an export the install must Make first: it runs only when it is named, and a named run that finds no export
// Fails with its own message
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
    // Time and a record another fit fetched meanwhile would not outwait its timeout
    // oxlint-disable-next-line no-await-in-loop -- One device: a fit's compute holds the thread, so one fit runs at a
    builds.push(await fit(options));
  }
  return mergeGameDataBuilds(builds);
};
