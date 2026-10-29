import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupLogin } from "#src/models/setup/SetupLogin";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { getStepRow } from "#src/services/setup/getStepRow";

// A login's row: the probe succeeds only while the machine is logged in, and the row prints the login command when not.
// The status is read here and never changed, since a login is the person's to make
export const readLoginRow = (login: SetupLogin, environment: SetupEnvironment): SetupRow => {
  const { status } = environment.run(login.probe.file, login.probe.args);
  return getStepRow(`${login.name} login`, status === 0, login.login);
};
