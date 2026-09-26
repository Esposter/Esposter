import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

interface KeyedEntry {
  key: string;
  value: unknown;
}

interface OverrideDelta {
  added: string[];
  lifted: string[];
}

interface OxlintConfiguration {
  overrides: { files: string[]; rules?: RestrictedListRules }[];
  rules: Required<RestrictedListRules>;
}

interface RestrictedGlobal {
  message: string;
  name: string;
}

interface RestrictedImportPath {
  importNames?: string[];
  message: string;
  name: string;
}

interface RestrictedImportPattern {
  allowTypeImports?: boolean;
  group: string[];
  message: string;
}

interface RestrictedImports {
  paths: RestrictedImportPath[];
  patterns?: RestrictedImportPattern[];
}

interface RestrictedListCopies {
  // Each override that restates the list, by its first `files` glob
  deltas: Record<string, OverrideDelta>;
  readEntries: (rules: RestrictedListRules) => KeyedEntry[] | undefined;
  rule: keyof RestrictedListRules;
}

interface RestrictedListRules {
  "no-restricted-globals"?: [string, ...RestrictedGlobal[]];
  "no-restricted-imports"?: [string, RestrictedImports];
}
/**
 * Oxlint replaces a rule's options wholesale when an override sets the rule, rather than merging them with the root
 * list — so an override that lifts one ban or adds one has to restate every other entry, and `.oxlintrc.json` can
 * neither import nor reference a shared list. The copies are held to the root here instead: an override restates
 * each root entry verbatim, and is the root list with exactly the keys it declares below lifted or added, so a ban
 * added to the root and forgotten in an override fails here rather than going silently unenforced.
 */
describe("restrictedListCopies", () => {
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
  // A path is keyed by its module and the names it bans, a pattern by the first glob of its group
  const VUETIFY_BANS = ["path:@vuetify/v0", "pattern:@vuetify/v0/*"];
  const COPIES: RestrictedListCopies[] = [
    {
      deltas: {
        // A test stubs the browser and reads the design style it asserts on; only the polling and route bans follow it
        "**/*.test.ts": { added: [], lifted: [...BROWSER_GLOBALS, "useUiStyle"] },
        // The UI library is the one reader of the design style
        "apps/web/app/components/Ui/**": { added: [], lifted: ["useUiStyle"] },
        "scripts/src/**/*.ts": { added: ["fetch"], lifted: [] },
      },
      readEntries: (rules) => {
        const setting = rules["no-restricted-globals"];
        if (!setting) return undefined;
        const [, ...restrictedGlobals] = setting;
        return restrictedGlobals.map((value) => ({ key: value.name, value }));
      },
      rule: "no-restricted-globals",
    },
    {
      deltas: {
        "apps/*/src/**": { added: ["pattern:@/**", "pattern:./*"], lifted: VUETIFY_BANS },
        // The UI library is the one importer of Vuetify 0
        "apps/web/app/components/Ui/**": { added: [], lifted: VUETIFY_BANS },
        // `nuxt prepare` loads the configuration before any workspace library is built
        "apps/web/configuration/**": { added: ["pattern:@esposter/*"], lifted: [] },
        "apps/web/shared/**": { added: ["pattern:@/**"], lifted: [] },
      },
      readEntries: (rules) => {
        const setting = rules["no-restricted-imports"];
        if (!setting) return undefined;
        const [, { paths, patterns = [] }] = setting;
        return [
          ...paths.map((value) => ({ key: ["path", value.name, ...(value.importNames ?? [])].join(":"), value })),
          ...patterns.map((value) => {
            const [firstGlob = ""] = value.group;
            return { key: `pattern:${firstGlob}`, value };
          }),
        ];
      },
      rule: "no-restricted-imports",
    },
  ];
  const { overrides, rules } = parseMachineJson<OxlintConfiguration>(
    readFileSync(join(REPOSITORY_ROOT, ".oxlintrc.json"), "utf8"),
  );

  describe.each(COPIES)("$rule", ({ deltas, readEntries }) => {
    const rootEntries = readEntries(rules) ?? [];
    const overrideEntries = overrides.flatMap(({ files: [glob = ""], rules: overrideRules = {} }) => {
      const entries = readEntries(overrideRules);
      return entries ? [{ entries, glob }] : [];
    });

    test("declares the delta of every override that restates the list", () => {
      expect.hasAssertions();

      expect(overrideEntries.map(({ glob }) => glob).toSorted()).toStrictEqual(Object.keys(deltas).toSorted());
    });

    // An entry an override adds is its own ban, so two overrides may add different bans under one key
    test("restates every root entry verbatim", () => {
      expect.hasAssertions();

      const rootValues = new Map(rootEntries.map(({ key, value }) => [key, JSON.stringify(value)]));
      const driftedKeys = overrideEntries.flatMap(({ entries, glob }) =>
        entries
          .filter(({ key, value }) => rootValues.has(key) && rootValues.get(key) !== JSON.stringify(value))
          .map(({ key }) => `${glob} ${key}`),
      );

      expect(driftedKeys).toStrictEqual([]);
    });

    test.each(Object.entries(deltas))("restates the root list in %s", (glob, { added, lifted }) => {
      expect.hasAssertions();

      const entries = overrideEntries.find((overrideEntry) => overrideEntry.glob === glob)?.entries ?? [];
      const expectedKeys = [...rootEntries.map(({ key }) => key).filter((key) => !lifted.includes(key)), ...added];

      expect(entries.map(({ key }) => key).toSorted()).toStrictEqual(expectedKeys.toSorted());
    });
  });
});
