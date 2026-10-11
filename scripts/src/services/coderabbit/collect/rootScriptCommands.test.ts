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
  // `lint` and `typecheck` are tasks of the root vite.config.ts, so a name resolves to a script or to a task's command
  const { default: viteConfiguration } = (await import(
    pathToFileURL(join(REPOSITORY_ROOT, "vite.config.ts")).href
  )) as { default: { run: { tasks: Record<string, { command?: string; dependsOn?: string[] }> } } };
  const VP_RUN_PREFIX = "vp run ";
  const CHAIN_SEPARATOR = " && ";
  // A root script or task that aggregates named tasks is each of those expanded in order: its `dependsOn`, or the
  // `vp run` steps of a `&&` chain. Any other is run by name. Nothing here quotes an argument, so a split on the chain
  // Separator is the whole of the parsing — one that grows a quoted argument fails here, which is the right place to find out.
  const getChildNames = (scripts: Record<string, string>, name: string): string[] => {
    const task = viteConfiguration.run.tasks[name];
    if (task?.dependsOn) return task.dependsOn;
    const script = scripts[name] ?? task?.command ?? "";
    return script.startsWith(VP_RUN_PREFIX)
      ? script.split(CHAIN_SEPARATOR).map((step) => step.slice(VP_RUN_PREFIX.length))
      : [];
  };
  const getExpandedCommands = (scripts: Record<string, string>, name: string): string[][] => {
    const children = getChildNames(scripts, name);
    return children.length > 0 ? children.flatMap((child) => getExpandedCommands(scripts, child)) : [[name]];
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
