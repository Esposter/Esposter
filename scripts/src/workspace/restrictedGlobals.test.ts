import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

interface OverrideDelta {
  added: string[];
  lifted: string[];
}

interface OxlintConfiguration {
  overrides: { files: string[]; rules?: RestrictedGlobalsRules }[];
  rules: Required<RestrictedGlobalsRules>;
}

interface RestrictedGlobal {
  message: string;
  name: string;
}

interface RestrictedGlobalsRules {
  "no-restricted-globals"?: [string, ...RestrictedGlobal[]];
}
/**
 * Oxlint replaces a rule's options wholesale when an override sets the rule, rather than merging them with the root
 * list — so an override that lifts one ban or adds one has to restate every other entry, and `.oxlintrc.json` can
 * neither import nor reference a shared list. The copies are held to the root here instead: each shared name carries
 * one message everywhere, and each override is the root list with exactly the names it declares below lifted or
 * added, so a ban added to the root and forgotten in an override fails here rather than going silently unenforced.
 */
describe("restrictedGlobals", () => {
  const BROWSER_GLOBALS = [
    "document",
    "history",
    "localStorage",
    "location",
    "matchMedia",
    "navigator",
    "screen",
    "sessionStorage",
  ];
  // Keyed by each override's first `files` glob
  const OVERRIDE_DELTAS: Record<string, OverrideDelta> = {
    // A test stubs the browser and reads the design style it asserts on; only the polling and route bans follow it
    "**/*.test.ts": { added: [], lifted: [...BROWSER_GLOBALS, "useUiStyle"] },
    // The UI library is the one reader of the design style
    "apps/web/app/components/Ui/**": { added: [], lifted: ["useUiStyle"] },
    "scripts/src/**/*.ts": { added: ["fetch"], lifted: [] },
  };
  const { overrides, rules } = parseMachineJson<OxlintConfiguration>(
    readFileSync(join(REPOSITORY_ROOT, ".oxlintrc.json"), "utf8"),
  );
  const [, ...rootEntries] = rules["no-restricted-globals"];
  const overrideEntries = overrides.flatMap(({ files: [glob = ""], rules: overrideRules }) => {
    const setting = overrideRules?.["no-restricted-globals"];
    if (!setting) return [];
    const [, ...entries] = setting;
    return [{ entries, glob }];
  });

  test("declares the delta of every override that restates the list", () => {
    expect.hasAssertions();

    expect(overrideEntries.map(({ glob }) => glob).toSorted()).toStrictEqual(Object.keys(OVERRIDE_DELTAS).toSorted());
  });

  test("gives every name one message across the root and every override", () => {
    expect.hasAssertions();

    const messagesByName = Map.groupBy(
      [rootEntries, ...overrideEntries.map(({ entries }) => entries)].flat(),
      ({ name }) => name,
    );
    const conflictingNames = [...messagesByName]
      .filter(([, entries]) => new Set(entries.map(({ message }) => message)).size > 1)
      .map(([name]) => name);

    expect(conflictingNames).toStrictEqual([]);
  });

  test.each(Object.entries(OVERRIDE_DELTAS))("restates the root list in %s", (glob, { added, lifted }) => {
    expect.hasAssertions();

    const entries = overrideEntries.find((overrideEntry) => overrideEntry.glob === glob)?.entries ?? [];
    const expectedNames = [...rootEntries.map(({ name }) => name).filter((name) => !lifted.includes(name)), ...added];

    expect(entries.map(({ name }) => name)).toStrictEqual(expectedNames);
  });
});
