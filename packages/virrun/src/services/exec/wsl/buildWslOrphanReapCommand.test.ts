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

  // Group-kills only orphans: matched by marker, off the Relay parent (a live run's shell is Relay-parented, so
  // Skipping those keeps the kill to orphans), with the TERM group kill and the reaper's self-exclusion guard.
  test("group-kills only orphans — matched by marker, off the Relay parent, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    expect(takeOne(buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER), 4)).toMatchInlineSnapshot(`
      "self=$$
      for pid in $(pgrep -f "virrun-bwrap" 2>/dev/null); do
        [ "$pid" = "$self" ] && continue
        ppid=$(cut -d" " -f4 /proc/"$pid"/stat 2>/dev/null)
        [ -z "$ppid" ] && continue
        case "$(cat /proc/"$ppid"/comm 2>/dev/null)" in Relay*) continue;; esac
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")
        [ -n "$pgid" ] && kill -TERM "-$pgid" 2>/dev/null
      done"
    `);
  });
});
