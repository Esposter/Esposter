import {
  INSTALL_COMMAND,
  REPAIR_BUILD_APPS_COMMAND,
  REPAIR_REGENERATE_COMMANDS,
  REPAIR_VERIFY_COMMANDS,
} from "#src/services/coderabbit/collect/constants";
import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

// The collector runs the repository's own checks and its own regenerators, an aggregating root script or task by its
// Passes so each reports on its own. That is a copy of the root aggregations nothing else holds them to:
// A pass added to `lint` would silently stop being a gate on everything reaching `main`, and a regenerator added to
// `lint:fix` would silently stop being tried before a session is spent on the red it answers.
describe("rootScriptCommands", async () => {
  // `lint` and `typecheck` are tasks of the root vite.config.ts, cached by `vp run`, so a name resolves to a script
  // Or to a task's command
  const { default: viteConfiguration } = (await import(
    pathToFileURL(join(REPOSITORY_ROOT, "vite.config.ts")).href
  )) as { default: { run: { tasks: Record<string, { command: string }> } } };
  const RUN_S_PREFIX = "run-s ";
  const WHITESPACE_REGEX = /\s+/u;
  // A root script or task that aggregates named scripts with `run-s` is each of those expanded in order, its flags
  // Dropped; any other is run by name. No aggregation here quotes an argument, so a split on whitespace is the
  // Whole of the parsing — one that grows a quoted argument fails here, which is the right place to find out.
  const getExpandedCommands = (scripts: Record<string, string>, name: string): string[][] => {
    const script = scripts[name] ?? viteConfiguration.run.tasks[name]?.command ?? "";
    if (script.startsWith(RUN_S_PREFIX))
      return script
        .slice(RUN_S_PREFIX.length)
        .split(WHITESPACE_REGEX)
        .filter((word) => !word.startsWith("--"))
        .flatMap((child) => getExpandedCommands(scripts, child));
    else return [[name]];
  };
  const getExpandedSteps = (steps: (string | string[])[]): string[][] => {
    const { scripts = {} } = parseMachineJson<{ scripts?: Record<string, string> }>(
      readFileSync(join(REPOSITORY_ROOT, PACKAGE_JSON_FILENAME), "utf8"),
    );
    return steps.flatMap((step) => (typeof step === "string" ? getExpandedCommands(scripts, step) : [step]));
  };

  // The checks a repair owes, in the order they run: a root script named as the one it stands in for,
  // Or the one command no root script holds — the two app bundles the suite asserts against.
  test("the repair runs what the root scripts run", () => {
    expect.hasAssertions();

    const expected = getExpandedSteps([
      "format:check",
      ["exec", "vp", "run", "build:packages"],
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
