import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { REFERENCES_RESTORE_NEXT } from "#src/services/setup/constants";

// The parity references come down by a restore command that is not written yet, so the step cannot be in place until it is
export const readReferencesRow = (): SetupRow => ({
  next: REFERENCES_RESTORE_NEXT,
  status: SetupStatus.NeedsYou,
  step: "parity references",
});
