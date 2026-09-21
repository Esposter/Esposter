import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { MINIMUM_BUBBLEWRAP_VERSION } from "#src/services/cli/doctor/constants";
import { readSandboxProbeOutput } from "#src/services/cli/doctor/readSandboxProbeOutput";
import { checkIsVersionAtLeast } from "#src/services/cli/run/checkIsVersionAtLeast";

export const probeBubblewrap = (): DiagnosticCheck => {
  const label = `bubblewrap >= ${MINIMUM_BUBBLEWRAP_VERSION}`;
  const type = DiagnosticCheckType.Bubblewrap;
  const output = readSandboxProbeOutput("bwrap", ["--version"]);
  if (output === undefined)
    return {
      fix: "install bubblewrap (e.g. `sudo apt install -y bubblewrap`)",
      label,
      note: "not found on PATH",
      status: DiagnosticStatus.Missing,
      type,
    };
  if (checkIsVersionAtLeast(output, MINIMUM_BUBBLEWRAP_VERSION))
    return { fix: "", label, note: output, status: DiagnosticStatus.Ok, type };
  return {
    fix: `upgrade bubblewrap to >= ${MINIMUM_BUBBLEWRAP_VERSION} for RAM-overlay support`,
    label,
    note: `${output} is too old`,
    status: DiagnosticStatus.Missing,
    type,
  };
};
