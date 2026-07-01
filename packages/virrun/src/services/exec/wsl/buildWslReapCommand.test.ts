import { buildWslReapCommand } from "@/services/exec/wsl/buildWslReapCommand";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const MARKER = "virrun-bwrap-test-marker";

describe(buildWslReapCommand, () => {
  test("runs the reaper through wsl.exe --exec sh -c", () => {
    expect.hasAssertions();

    const command = buildWslReapCommand(MARKER);

    expect(command.slice(0, 4)).toStrictEqual(["wsl.exe", "--exec", "sh", "-c"]);
  });

  test("matches the run by its marker and group-kills it, excluding the reaper's own shell", () => {
    expect.hasAssertions();

    const script = takeOne(buildWslReapCommand(MARKER), 4);

    expect(script).toContain(`pgrep -f "${MARKER}"`);
    // Group kill (negative pgid) with TERM so bwrap can unwind, and self-exclusion so the reaper does not kill itself.
    expect(script).toContain('kill -TERM "-$pgid"');
    expect(script).toContain('[ "$pid" = "$self" ] && continue');
  });
});
