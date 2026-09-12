import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { readProbeOutput } from "#src/services/cli/doctor/readProbeOutput";
import { PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { getTarExecutable } from "#src/services/exec/util/getTarExecutable";
import { takeOne } from "@esposter/shared";
// Off win32 the source already lives on the host FS, so no mirror and no archive — the check is N/A. On win32 the
// Source is synced onto the ext4 mirror through a tar archive staged by the HOST tar (createSourceMirrorArchive) —
// Probed directly on Windows, never through readSandboxProbeOutput, because that is where it runs — so a missing
// Tar.exe aborts every os run that has a delta to apply. The extract side inside WSL needs no probe: GNU tar is an
// Essential package in every distro, unlike the rsync this replaced.
export const probeTar = (): DiagnosticCheck => {
  const label = "host tar (source mirror)";
  const type = DiagnosticCheckType.Tar;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the source is read in place, not mirrored",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  const output = readProbeOutput(() =>
    execFileHidden(getTarExecutable(), ["--version"], { timeout: PROBE_TIMEOUT_MS }),
  );
  return output === undefined
    ? {
        fix: "install Windows tar (bsdtar ships with Windows 10 1803+ at System32\\tar.exe; check PATH)",
        label,
        note: "not found — the repo source can't be mirrored onto ext4, so os runs abort",
        status: DiagnosticStatus.Missing,
        type,
      }
    : { fix: "", label, note: takeOne(output.split("\n"), 0), status: DiagnosticStatus.Ok, type };
};
