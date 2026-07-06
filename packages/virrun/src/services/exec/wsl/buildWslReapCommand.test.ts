import { buildWslReapCommand } from "@/services/exec/wsl/buildWslReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER } from "@/services/exec/wsl/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildWslReapCommand, () => {
  test("runs the reaper through wsl.exe --exec sh -c", () => {
    expect.hasAssertions();

    const command = buildWslReapCommand(VIRRUN_WSL_PROCESS_MARKER);

    expect(command.slice(0, 4)).toStrictEqual(["wsl.exe", "--exec", "sh", "-c"]);
  });

  // Matches the run by its marker and group-kills it (negative pgid, TERM so bwrap unwinds), excluding the reaper's
  // Own shell via the self-exclusion guard.
  test("matches the run by its marker and group-kills it, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    expect(takeOne(buildWslReapCommand(VIRRUN_WSL_PROCESS_MARKER), 4)).toMatchInlineSnapshot(`
      "self=$$
      for pid in $(pgrep -f "virrun-bwrap" 2>/dev/null); do
        [ "$pid" = "$self" ] && continue
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")
        [ -n "$pgid" ] && kill -TERM "-$pgid" 2>/dev/null
      done"
    `);
  });
});
