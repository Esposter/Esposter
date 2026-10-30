import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";

// The command fails only while a step needs the person.
// An install is the game client's alone and never fails it, and an information row reports without judging
export const getSetupExitCode = (rows: readonly SetupRow[]): number =>
  rows.some(({ status }) => status === SetupStatus.NeedsYou) ? 1 : 0;
