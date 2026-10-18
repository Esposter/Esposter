import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A name selects the fit it is, and every fit under it as a group, so `ground` selects each `ground/<area>`
const checkIsSelectedBy = (name: string, selected: string): boolean =>
  name === selected || name.startsWith(`${selected}/`);

// A component's fits by name, each returning its report and the records it fits under their keys: every fit, or only
// Those named, so one fit's change is published without every other record refitted, one after the other. A name no fit
// Has is an error. Each fit is handed the run's options, so a dry run reaches every fit that writes a world data file
export const runFits = async (
  fits: Record<string, (options: { isDryRun: boolean }) => Promise<GameDataBuild>>,
  only: readonly string[],
  options: { isDryRun: boolean },
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
