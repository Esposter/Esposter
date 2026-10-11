import { FLEET_REF_TIMEOUT_MILLISECONDS } from "#src/services/fleet/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// A git call to origin's fleet refs, bounded, since the hold and the watcher that make it run for hours and a call left
// Waiting on a stalled network freezes the whole loop
export const runFleetRefGit = (args: string[]): string =>
  runGit(args, REPOSITORY_ROOT, undefined, FLEET_REF_TIMEOUT_MILLISECONDS);
