import { EXPRESS_VERIFY_COMMANDS, INSTALL_COMMAND } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The checks the express lane owes, named as the root scripts they stand in for and in the order it runs them
const VERIFY_SCRIPTS = ["format:check", "build:packages", "typecheck", "lint", "test"];
const VIRRUN_PREFIX = "virrun -- ";
const WHITESPACE_REGEX = /\s+/u;

// A root script that wraps its passes in `virrun` is expanded to those passes; one that does not is run by name.
// `pnpm foo` addresses the root script `foo`, so the word itself is dropped and the rest is what `spawnPnpm`
// Passes; anything else is a binary, which `pnpm` reaches through `exec`. No root script here quotes an
// Argument, so a split on whitespace is the whole of the parsing — one that grows a quoted argument fails here,
// Which is the right place to find out.
const getExpandedCommands = (script: string): string[][] =>
  script.includes(VIRRUN_PREFIX)
    ? script.split("&&").map((segment) => {
        const words = segment.trim().slice(VIRRUN_PREFIX.length).trim().split(WHITESPACE_REGEX);
        if (words[0] === "pnpm") return words.slice(1);

        words.unshift("exec");
        return words;
      })
    : [];

describe("expressVerifyCommands", () => {
  // The express lane pushes straight to `main`, so the checks it runs are the only gate those commits get. It
  // Cannot run the root scripts as they are — `virrun` snapshots the repository, and the lane's checks run in a
  // Throwaway worktree — so it spells out what each one does, which is a copy of the root manifest that nothing
  // Else holds it to: a pass added to `lint` would silently stop being a gate on everything reaching `main`.
  test("the lane runs what the root scripts run, minus the virrun wrapper", () => {
    expect.hasAssertions();

    const { scripts = {} } = parseMachineJson<{ scripts?: Record<string, string> }>(
      readFileSync(join(REPOSITORY_ROOT, "package.json"), "utf8"),
    );
    const expected = VERIFY_SCRIPTS.flatMap((name) => {
      const script = scripts[name] ?? "";
      const expanded = getExpandedCommands(script);
      return expanded.length > 0 ? expanded : [[name]];
    });

    expect(EXPRESS_VERIFY_COMMANDS).toStrictEqual([INSTALL_COMMAND, ...expected]);
  });
});
