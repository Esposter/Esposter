import { buildWslOrphanReapCommand } from "@/services/exec/wsl/buildWslOrphanReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER } from "@/services/exec/wsl/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildWslOrphanReapCommand, () => {
  test("runs the reaper through wsl.exe --exec sh -c", () => {
    expect.hasAssertions();

    const command = buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER);

    expect(command.slice(0, 4)).toStrictEqual(["wsl.exe", "--exec", "sh", "-c"]);
  });

  test("group-kills only orphans — matched by marker, off the Relay parent, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    const script = takeOne(buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER), 4);

    expect(script).toContain(`pgrep -f "${VIRRUN_WSL_PROCESS_MARKER}"`);
    // A live run's shell is parented by the wsl.exe Relay; skipping Relay-parented pids keeps the kill to orphans only.
    expect(script).toContain("Relay*) continue");
    // Group kill (negative pgid) with TERM so bwrap unwinds, and self-exclusion so the reaper never kills itself.
    expect(script).toContain('kill -TERM "-$pgid"');
    expect(script).toContain('[ "$pid" = "$self" ] && continue');
  });
});
