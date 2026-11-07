import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

// A fit as `runFits` takes it: its name, which `--only` selects, the function that fits its records, and its options.
// An opt-in fit reads an export the install must make first, so it runs only when it is named
export type RunFitEntry = readonly [
  name: string,
  fit: (options: DryRunOptions) => Promise<GameDataBuild>,
  options?: { isOptIn: boolean },
];
