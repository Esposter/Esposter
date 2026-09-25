import type { Plugin } from "@oxlint/plugins";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

interface OxlintConfiguration {
  jsPlugins: string[];
  overrides: { rules?: Record<string, unknown> }[];
  rules: Record<string, unknown>;
}
/**
 * A custom rule that is written but never switched on fails the way the oxlint skill warns a mis-scoped glob does:
 * to zero hits, with CI green. Three links have to hold for one to run — the entrypoint listed in `jsPlugins`, each
 * of its rules enabled at the root or in an override, and a fixture suite beside it proving it still fires — and
 * each is a separate edit a new plugin or rule can skip, so the three are read off the tree rather than remembered.
 */
describe("oxlintPlugins", () => {
  const PLUGINS_DIRECTORY = "scripts/src/oxlint";
  const PLUGIN_EXTENSION = ".ts";
  const SUITE_EXTENSION = ".test.ts";
  const { jsPlugins, overrides, rules } = parseMachineJson<OxlintConfiguration>(
    readFileSync(join(REPOSITORY_ROOT, ".oxlintrc.json"), "utf8"),
  );
  const pluginPaths = readdirSync(join(REPOSITORY_ROOT, PLUGINS_DIRECTORY))
    .filter((fileName) => fileName.endsWith(PLUGIN_EXTENSION) && !fileName.endsWith(SUITE_EXTENSION))
    .map((fileName) => `./${PLUGINS_DIRECTORY}/${fileName}`)
    .toSorted();
  const enabledRules = new Set(
    [rules, ...overrides.map((override) => override.rules ?? {})].flatMap((ruleMap) =>
      Object.entries(ruleMap)
        .filter(([, setting]) => setting !== "off")
        .map(([rule]) => rule),
    ),
  );
  let plugins: Plugin[] = [];

  beforeAll(async () => {
    plugins = await Promise.all(
      pluginPaths.map(async (pluginPath) => {
        const { default: plugin } = (await import(join(REPOSITORY_ROOT, pluginPath))) as { default: Plugin };
        return plugin;
      }),
    );
  });

  test("loads every plugin entrypoint", () => {
    expect.hasAssertions();

    expect(jsPlugins.toSorted()).toStrictEqual(pluginPaths);
  });

  test("enables every rule a plugin defines", () => {
    expect.hasAssertions();

    const disabledRules = plugins
      .flatMap(({ meta, rules: pluginRules }) => Object.keys(pluginRules).map((rule) => `${meta?.name}/${rule}`))
      .filter((rule) => !enabledRules.has(rule));

    expect(disabledRules).toStrictEqual([]);
  });

  test("proves every plugin with a fixture suite", () => {
    expect.hasAssertions();

    const unprovenPaths = pluginPaths.filter(
      (pluginPath) =>
        !existsSync(join(REPOSITORY_ROOT, `${pluginPath.slice(0, -PLUGIN_EXTENSION.length)}${SUITE_EXTENSION}`)),
    );

    expect(unprovenPaths).toStrictEqual([]);
  });
});
