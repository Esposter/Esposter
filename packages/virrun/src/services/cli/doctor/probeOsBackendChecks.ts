import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { probeBubblewrap } from "#src/services/cli/doctor/probeBubblewrap";
import { probePython3 } from "#src/services/cli/doctor/probePython3";
import { probeSandbox } from "#src/services/cli/doctor/probeSandbox";
import { probeTar } from "#src/services/cli/doctor/probeTar";
import { probeWslNode } from "#src/services/cli/doctor/probeWslNode";
// Probes every os-backend prerequisite (IO). Ordered cause → effect: the three components first, then the
// Authoritative overlay-mount verdict they feed.
export const probeOsBackendChecks = (): DiagnosticCheck[] => [
  probeBubblewrap(),
  probeWslNode(),
  probePython3(),
  probeTar(),
  probeSandbox(),
];
