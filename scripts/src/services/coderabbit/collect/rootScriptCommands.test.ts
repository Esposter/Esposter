import {
  INSTALL_COMMAND,
  REPAIR_BUILD_APPS_COMMAND,
  REPAIR_REGENERATE_COMMANDS,
  REPAIR_VERIFY_COMMANDS,
} from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The collector runs the repository's own checks and its own regenerators, and it cannot run the root scripts as
// They are — `virrun` snapshots the repository, and these run in a throwaway worktree — so each list spells out
// What the script it stands in for does. That is a copy of the root manifest nothing else holds them to: a pass
// Added to `lint` would silently stop being a gate on everything reaching `main`, and a regenerator added to
// `lint:fix` would silently stop being tried before a session is spent on the red it answers.
describe("rootScriptCommands", () => {
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
  const getExpandedSteps = (steps: (string | string[])[]): string[][] => {
    const { scripts = {} } = parseMachineJson<{ scripts?: Record<string, string> }>(
      readFileSync(join(REPOSITORY_ROOT, "package.json"), "utf8"),
    );
    return steps.flatMap((step) => (typeof step === "string" ? getExpandedCommands(scripts, step) : [step]));
  };

  // The checks a repair owes, in the order they run: a root script named as the one it stands in for,
  // Or the one command no root script holds — the two app bundles the suite asserts against.
  test("the repair runs what the root scripts run, minus the virrun wrapper", () => {
    expect.hasAssertions();

    const expected = getExpandedSteps([
      "format:check",
      "build:packages",
      "typecheck",
      "lint",
      REPAIR_BUILD_APPS_COMMAND,
      "test",
    ]);

    expect(REPAIR_VERIFY_COMMANDS).toStrictEqual([INSTALL_COMMAND, ...expected]);
  });

  // Every root script that rewrites a tracked artifact rather than reading one. `lint:fix` is `lint`'s own
  // Counterpart and expands the same way, so a lint pass added to one and not the other is caught by whichever
  // Test the omission falls under.
  test("the repairer regenerates with what the root scripts regenerate with", () => {
    expect.hasAssertions();

    expect(REPAIR_REGENERATE_COMMANDS).toStrictEqual(
      getExpandedSteps(["format", "lint:fix", "ai:sweep:ledger-coverage"]),
    );
  });
});
