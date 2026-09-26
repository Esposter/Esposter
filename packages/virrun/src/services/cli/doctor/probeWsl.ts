import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { WSL_PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { readWslFailureReason } from "#src/services/exec/wsl/readWslFailureReason";
import { getResult } from "@esposter/shared";

// Off win32 there is no guest to start, so the check is N/A. On win32 every other sandbox probe runs inside the default
// Distro, so this one asks first whether it starts at all — and reports wsl.exe's own reason when it does not (a host
// Out of memory reads "Insufficient system resources … HCS/0x800705aa"), which is the one fact the tool probes behind
// It cannot tell apart from their tool being missing.
export const probeWsl = (): DiagnosticCheck => {
  const label = "WSL2 distro";
  const type = DiagnosticCheckType.Wsl;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the sandbox runs on this kernel",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  return getResult(() => execWsl(["--exec", "true"], { timeout: WSL_PROBE_TIMEOUT_MS })).match(
    (): DiagnosticCheck => ({ fix: "", label, note: "the default distro starts", status: DiagnosticStatus.Ok, type }),
    (error): DiagnosticCheck => {
      const reason = readWslFailureReason(error);
      return {
        fix: "free memory or run `wsl --shutdown`, then retry; `wsl --status` names the default distro",
        label,
        note: `does not start — ${reason}`,
        status: DiagnosticStatus.Missing,
        type,
      };
    },
  );
};
