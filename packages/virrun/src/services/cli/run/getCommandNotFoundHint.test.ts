import { stripAnsi } from "#src/services/cli/color/stripAnsi.test";
import { getCommandNotFoundHint } from "#src/services/cli/run/getCommandNotFoundHint";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, assert, beforeEach, describe, expect, test } from "vitest";

describe(getCommandNotFoundHint, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const script = "script";
  const bwrapError = `bubblewrap failed to set up the sandbox\nbwrap: execvp ${script}: No such file or directory`;
  let cwd = "";

  beforeEach(() => {
    cwd = create();
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ scripts: { [script]: "" } }));
  });

  afterEach(() => {
    cleanup();
  });

  test("suggests the pnpm form when the missing command is a package script", () => {
    expect.hasAssertions();

    const hint = getCommandNotFoundHint([script], bwrapError, cwd);
    assert.exists(hint);

    expect(stripAnsi(hint)).toMatchInlineSnapshot(`
      "[virrun] "script" is not an executable — virrun runs commands, not package scripts.
      [virrun] Did you mean:  virrun -- pnpm script"
    `);
  });

  test("detects the node ENOENT phrasing as well as bwrap's execvp", () => {
    expect.hasAssertions();

    const hint = getCommandNotFoundHint([script], `Error: spawn ${script} ENOENT`, cwd);
    assert.exists(hint);

    expect(stripAnsi(hint)).toMatchInlineSnapshot(`
      "[virrun] "script" is not an executable — virrun runs commands, not package scripts.
      [virrun] Did you mean:  virrun -- pnpm script"
    `);
  });

  test("gives generic executable guidance when the missing command is not a script", () => {
    expect.hasAssertions();

    const hint = getCommandNotFoundHint(["a"], "bwrap: execvp a: No such file or directory", cwd);
    assert.exists(hint);

    expect(stripAnsi(hint)).toMatchInlineSnapshot(`
      "[virrun] "a" is not an executable — virrun runs commands, not package scripts.
      [virrun] Pass a real executable, e.g. \`virrun -- pnpm a\`, and check it is installed and spelled correctly."
    `);
  });

  test("returns undefined when the error is unrelated to a missing command", () => {
    expect.hasAssertions();

    expect(getCommandNotFoundHint([script], "", cwd)).toBeUndefined();
  });

  test("returns undefined when the missing binary is not the command the user asked to run", () => {
    expect.hasAssertions();

    expect(getCommandNotFoundHint(["a", script], "bwrap: execvp b: No such file or directory", cwd)).toBeUndefined();
  });
});
