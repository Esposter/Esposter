import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { HOOKS_PATH, HOOKS_PATH_KEY } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// Git reads hooks from the repository's own folder once its `core.hooksPath` names it, which the setup sets when it is not
export const readHooksRow = (environment: SetupEnvironment): SetupRow => {
  const step = "git hooks";
  const { status, stdout } = environment.run("git", ["config", "--get", HOOKS_PATH_KEY]);
  if (status === 0 && stdout?.trim() === HOOKS_PATH) return getStepRow(step, true, "");
  const { status: setStatus } = environment.run("git", ["config", HOOKS_PATH_KEY, HOOKS_PATH]);
  return setStatus === 0
    ? { next: "", status: SetupStatus.Done, step }
    : getStepRow(step, false, `git config ${HOOKS_PATH_KEY} ${HOOKS_PATH}`);
};
