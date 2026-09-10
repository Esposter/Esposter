import { buildWslReapCommand } from "#src/services/exec/wsl/buildWslReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER, WSL_REAPER_SHELL_NAME } from "#src/services/exec/wsl/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildWslReapCommand, () => {
  const OTHER_MARKER = `${VIRRUN_WSL_PROCESS_MARKER}-other`;

  // The markers ride the argv behind a non-marker `$0`, so a set of any size needs no quoting and the reaper's own
  // Shell is not marker-shaped.
  test("runs the reaper through wsl.exe --exec sh -c, passing every marker as an argument", () => {
    expect.hasAssertions();

    const command = buildWslReapCommand([VIRRUN_WSL_PROCESS_MARKER, OTHER_MARKER]);

    expect(command.slice(0, 4)).toStrictEqual(["wsl.exe", "--exec", "sh", "-c"]);
    expect(command.slice(5)).toStrictEqual([WSL_REAPER_SHELL_NAME, VIRRUN_WSL_PROCESS_MARKER, OTHER_MARKER]);
  });

  // Matches each named run by its marker and group-kills it (negative pgid, TERM so bwrap unwinds), excluding the
  // Reaper's own shell via the self-exclusion guard.
  test("matches each run by its marker and group-kills it, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    expect(takeOne(buildWslReapCommand([VIRRUN_WSL_PROCESS_MARKER]), 4)).toMatchInlineSnapshot(`
      "self=$$
      pgids=
      for marker in "$@"; do
        for pid in $(pgrep -f "$marker" 2>/dev/null); do
          [ "$pid" = "$self" ] && continue
          pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")
          [ -n "$pgid" ] || continue
          kill -TERM "-$pgid" 2>/dev/null
          pgids="$pgids $pgid"
        done
      done"
    `);
  });

  // What `cache clean` depends on: TERM only asks, so the reaper waits — bounded, and on the killed process groups
  // Rather than the markers, since the marker is on the shell TERM kills first while the bwrap holding the dirs open
  // Is still unwinding.
  test("waits for the killed trees to exit when blocking", () => {
    expect.hasAssertions();

    expect(takeOne(buildWslReapCommand([VIRRUN_WSL_PROCESS_MARKER], true), 4)).toMatchInlineSnapshot(`
      "self=$$
      pgids=
      for marker in "$@"; do
        for pid in $(pgrep -f "$marker" 2>/dev/null); do
          [ "$pid" = "$self" ] && continue
          pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")
          [ -n "$pgid" ] || continue
          kill -TERM "-$pgid" 2>/dev/null
          pgids="$pgids $pgid"
        done
      done
      deadline=$(($(date +%s) + 30))
      while [ "$(date +%s)" -lt "$deadline" ]; do
        alive=
        for pgid in $pgids; do
          pgrep -g "$pgid" >/dev/null 2>&1 && alive=1
        done
        [ -n "$alive" ] || break
        sleep 0.2
      done"
    `);
  });
});
