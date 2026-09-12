import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/OutdatedDependencyCheck";

import { PNPM_OUTDATED_COMMAND } from "#src/services/outdatedDependencies/pnpm/constants";

// A run that answered nothing usable: the one error is attributed to the command itself, since no package can
// Be blamed for it.
export const getPnpmOutdatedFailure = (error: string): OutdatedDependencyCheck => ({
  errors: [{ error, pkg: PNPM_OUTDATED_COMMAND }],
  outdatedDependencies: [],
});
