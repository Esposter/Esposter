import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

// A fit's records, given the names of the fits to run (none, for all) and whether it is a dry run, which writes no
// Region data file and publishes nothing
export type DerivedAssetFit = (only: readonly string[], options: DryRunOptions) => Promise<GameDataBuild>;
