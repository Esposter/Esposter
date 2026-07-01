import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { runDoctor } from "@/services/cli/runDoctor";
import { defineCommand } from "citty";
// Diagnoses why the os backend is or isn't available on this host — bubblewrap, WSL node (win32), python3, and the
// Real overlay-mount probe — so a fallback to native is explained, not silent. Exits non-zero on any gap.
export const doctorCommand: CommandDef = defineCommand({
  meta: {
    description: "Diagnose the os backend's prerequisites and report what's missing.",
    name: CommandType.Doctor,
  },
  run: () => {
    process.exitCode = runDoctor();
  },
});
