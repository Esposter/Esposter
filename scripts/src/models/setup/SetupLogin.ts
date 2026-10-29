import type { SetupProbe } from "#src/models/setup/SetupProbe";

// A service the machine is logged in to: the probe that succeeds when it is, and the command that logs in when it is not
export interface SetupLogin {
  login: string;
  name: string;
  probe: SetupProbe;
}
