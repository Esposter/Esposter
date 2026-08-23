import { buildWslOrphanReapCommand } from "#src/services/exec/wsl/buildWslOrphanReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER } from "#src/services/exec/wsl/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildWslOrphanReapCommand, () => {
  test("runs the reaper through wsl.exe --exec sh -c", () => {
    expect.hasAssertions();

    const command = buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER);

    expect(command.slice(0, 4)).toStrictEqual(["wsl.exe", "--exec", "sh", "-c"]);
  });

  // Group-kills only orphans, with every guard failing closed: matched by marker, group leaders only (a live run's
  // Forked children inherit the marker cmdline off a non-Relay parent), off the Relay parent, past the minimum age
  // (spawn/teardown windows where the Relay parent is transiently absent), with the TERM group kill and the reaper's
  // Self-exclusion guard.
  test("group-kills only orphans — marker-matched group leaders past the minimum age, off the Relay parent, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    expect(takeOne(buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER), 4)).toMatchInlineSnapshot(`
      "self=$$
      for pid in $(pgrep -f "virrun-bwrap" 2>/dev/null); do
        [ "$pid" = "$self" ] && continue
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")
        [ "$pid" = "$pgid" ] || continue
        ppid=$(cut -d" " -f4 /proc/"$pid"/stat 2>/dev/null)
        [ -z "$ppid" ] && continue
        parentComm=$(cat /proc/"$ppid"/comm 2>/dev/null)
        [ -z "$parentComm" ] && continue
        case "$parentComm" in Relay*) continue;; esac
        etimes=$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d " ")
        { [ -n "$etimes" ] && [ "$etimes" -ge 10 ]; } || continue
        kill -TERM "-$pgid" 2>/dev/null
      done"
    `);
  });
});
