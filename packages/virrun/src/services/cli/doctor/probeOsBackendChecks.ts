import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { probeBubblewrap } from "#src/services/cli/doctor/probeBubblewrap";
import { probePython3 } from "#src/services/cli/doctor/probePython3";
import { probeSandbox } from "#src/services/cli/doctor/probeSandbox";
import { probeTar } from "#src/services/cli/doctor/probeTar";
import { probeWsl } from "#src/services/cli/doctor/probeWsl";
import { probeWslNode } from "#src/services/cli/doctor/probeWslNode";

// Probes every os-backend prerequisite (IO). Ordered cause → effect: WSL first, the components next, then the
// Authoritative overlay-mount verdict they feed. A WSL that does not start stops there with only the host-side tar
// Beside it: every probe after it would run inside the guest and read the dead VM as its own tool missing.
export const probeOsBackendChecks = (): DiagnosticCheck[] => {
  const wsl = probeWsl();
  if (wsl.status === DiagnosticStatus.Missing) return [wsl, probeTar()];
  return [wsl, probeBubblewrap(), probeWslNode(), probePython3(), probeTar(), probeSandbox()];
};
