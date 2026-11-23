import type { SelectorBan } from "#src/models/oxlint/selectorBan/SelectorBan";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface SelectorBanFixture {
  // The path that decides the lists reaching it, under the app. Each fixture sits in a folder of its own name below the
  // App's, so two may share a path, and a list scoped to `app/` or `composables/` still reaches it
  filePath: string;
  name: string;
  source: string;
  violations: number;
}

interface SetupSelectorBanSuiteOptions {
  // The bans under test, told apart from every other ban by their message
  entries: SelectorBan[];
  fixtures: SelectorBanFixture[];
}

interface VizeLintReport {
  file: string;
  messages: { message: string }[];
}

// A JSON config rather than a `.ts` one: the body is serialized, and the config sits in the linted directory
// A fixture is the app's own file, which every list can reach, as it was when the app's lint config read the fixtures
const APP_DIRECTORY = join("apps", "web");
const CONFIG_FILENAME = ".oxlintrc.json";
const OXLINT_BIN = join(REPOSITORY_ROOT, "node_modules", "oxlint", "bin", "oxlint");
const SELECTOR_BAN_PLUGIN = join(REPOSITORY_ROOT, "scripts", "src", "oxlint", "selectorBan.ts").replaceAll("\\", "/");
const VIZE_BIN = join(REPOSITORY_ROOT, "node_modules", "vize", "bin", "vize");

// Every ban sits in a list that states the paths it runs over, so a fixture is linted through the plugin, which reads
// Every list, rather than the entry alone: that proves the selector runs and that its list's scope reaches the file kind
// And path it names. A script is oxlint's and a template is vize's,
// Run from the repository root so it reads the root `vite.config.ts`, so a component fixture goes through both. Each
// Runs once per suite, and only the entries under test are counted, so a fixture may break any other ban freely
export const setupSelectorBanSuite = ({ entries, fixtures }: SetupSelectorBanSuiteOptions): void => {
  const messages = new Set(entries.map(({ message }) => message));
  // A vize finding prefixes the entry's message with its rule, so an entry matches by its end
  const checkIsEntryMessage = (message: string) => [...messages].some((entry) => message.endsWith(entry));
  const fixtureViolationsMap = new Map<string, number>();
  let root = "";

  beforeAll(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "selector-ban-")));
    writeFileSync(
      join(root, CONFIG_FILENAME),
      JSON.stringify({
        categories: {},
        jsPlugins: [SELECTOR_BAN_PLUGIN],
        plugins: [],
        rules: { "selector-ban/no-restricted-syntax": "error" },
      }),
    );
    const fixtureNamesMap = new Map(
      fixtures.map(({ filePath, name, source }) => {
        const fixturePath = join(root, APP_DIRECTORY, name, filePath);
        mkdirSync(dirname(fixturePath), { recursive: true });
        writeFileSync(fixturePath, `${source}\n`);
        fixtureViolationsMap.set(name, 0);
        return [relative(root, fixturePath), name];
      }),
    );
    const countFile = (filePath: string, count: number) => {
      const name = fixtureNamesMap.get(relative(root, filePath));
      if (name !== undefined) fixtureViolationsMap.set(name, (fixtureViolationsMap.get(name) ?? 0) + count);
    };

    const { status, stderr, stdout } = spawnSync(
      process.execPath,
      [OXLINT_BIN, "--config", join(root, CONFIG_FILENAME), "--format=json", "--disable-nested-config", root],
      { cwd: root, encoding: "utf8" },
    );
    if (!stdout)
      throw new InvalidOperationError(Operation.Read, root, `oxlint produced no output (status ${status}): ${stderr}`);
    for (const { filename, message } of jsonDateParse<{ diagnostics: { filename: string; message: string }[] }>(stdout)
      .diagnostics)
      if (checkIsEntryMessage(message)) countFile(join(root, filename), 1);

    const componentPaths = fixtures.flatMap(({ filePath, name }) =>
      filePath.endsWith(".vue") ? [join(root, APP_DIRECTORY, name, filePath)] : [],
    );
    if (componentPaths.length === 0) return;
    const { stdout: vizeStdout } = spawnSync(
      process.execPath,
      [VIZE_BIN, "lint", "--format", "json", ...componentPaths],
      { cwd: REPOSITORY_ROOT, encoding: "utf8" },
    );
    for (const { file, messages: reportedMessages } of jsonDateParse<VizeLintReport[]>(vizeStdout))
      countFile(file, reportedMessages.filter(({ message }) => checkIsEntryMessage(message)).length);
  });

  afterAll(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test.each(fixtures)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(fixtureViolationsMap.get(name)).toBe(violations);
  });
};

describe.todo("setupSelectorBanSuite");
