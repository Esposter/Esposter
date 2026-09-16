import {
  EXPRESS_BUILD_APPS_COMMAND,
  EXPRESS_VERIFY_COMMANDS,
  INSTALL_COMMAND,
} from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("expressVerifyCommands", () => {
  // The checks the express lane owes, in the order it runs them: a root script named as the one it stands in for,
  // Or the one command no root script holds — the two app bundles the suite asserts against.
  const VERIFY_STEPS: (string | string[])[] = [
    "format:check",
    "build:packages",
    "typecheck",
    "lint",
    EXPRESS_BUILD_APPS_COMMAND,
    "test",
  ];
  const RUN_S_PREFIX = "run-s ";
  const VIRRUN_PREFIX = "virrun -- ";
  const WHITESPACE_REGEX = /\s+/u;
  // A root script that aggregates named scripts with `run-s` is each of those expanded in order, its flags
  // Dropped; one that wraps its passes in `virrun` is expanded to those passes; one that does neither is run by
  // Name. `pnpm foo` addresses the root script `foo`, so the word itself is dropped and the rest is what
  // `spawnPnpm` passes; anything else is a binary, which `pnpm` reaches through `exec`. No root script here quotes
  // An argument, so a split on whitespace is the whole of the parsing — one that grows a quoted argument fails
  // Here, which is the right place to find out.
  const getExpandedCommands = (scripts: Record<string, string>, name: string): string[][] => {
    const script = scripts[name] ?? "";
    if (script.startsWith(RUN_S_PREFIX))
      return script
        .slice(RUN_S_PREFIX.length)
        .split(WHITESPACE_REGEX)
        .filter((word) => !word.startsWith("--"))
        .flatMap((child) => getExpandedCommands(scripts, child));
    else if (script.includes(VIRRUN_PREFIX))
      return script.split("&&").map((segment) => {
        const words = segment.trim().slice(VIRRUN_PREFIX.length).trim().split(WHITESPACE_REGEX);
        if (words[0] === "pnpm") return words.slice(1);

        words.unshift("exec");
        return words;
      });
    return [[name]];
  };

  // The express lane pushes straight to `main`, so the checks it runs are the only gate those commits get. It
  // Cannot run the root scripts as they are — `virrun` snapshots the repository, and the lane's checks run in a
  // Throwaway worktree — so it spells out what each one does, which is a copy of the root manifest that nothing
  // Else holds it to: a pass added to `lint` would silently stop being a gate on everything reaching `main`.
  test("the lane runs what the root scripts run, minus the virrun wrapper", () => {
    expect.hasAssertions();

    const { scripts = {} } = parseMachineJson<{ scripts?: Record<string, string> }>(
      readFileSync(join(REPOSITORY_ROOT, "package.json"), "utf8"),
    );
    const expected = VERIFY_STEPS.flatMap((step) =>
      typeof step === "string" ? getExpandedCommands(scripts, step) : [step],
    );

    expect(EXPRESS_VERIFY_COMMANDS).toStrictEqual([INSTALL_COMMAND, ...expected]);
  });
});
