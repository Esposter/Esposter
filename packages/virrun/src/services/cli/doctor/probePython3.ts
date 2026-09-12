import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { readSandboxProbeOutput } from "#src/services/cli/doctor/readSandboxProbeOutput";

export const probePython3 = (): DiagnosticCheck => {
  const label = "python3 (write-back)";
  const type = DiagnosticCheckType.Python3;
  const output = readSandboxProbeOutput("python3", ["--version"]);
  return output === undefined
    ? {
        fix: "install python3 (used only to flush produced files to host on `virrun -- <cmd>`)",
        label,
        note: "not found — write-back (persist) can't reconcile produced files",
        status: DiagnosticStatus.Missing,
        type,
      }
    : { fix: "", label, note: output, status: DiagnosticStatus.Ok, type };
};
