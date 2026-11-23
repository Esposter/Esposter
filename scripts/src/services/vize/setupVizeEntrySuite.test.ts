import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface SetupVizeEntrySuiteOptions {
  // The directory under the repository root whose vize entry the fixtures fall in
  directory: string;
  fixtures: VizeEntryFixture[];
  // The start every message under test shares, which tells it apart from every other rule
  messageStart: string;
}

interface VizeEntryFixture {
  name: string;
  template: string;
  violations: number;
}

interface VizeLintReport {
  file: string;
  messages: { message: string }[];
}

// The vize lint matches its entries by the path under its root, so each fixture is linted inside a copy of the
// Entry's directory, under a root whose config is the repository's own. One vize run lints every fixture of the suite
export const setupVizeEntrySuite = ({ directory, fixtures, messageStart }: SetupVizeEntrySuiteOptions): void => {
  const VIZE_BINARY_PATH = join(REPOSITORY_ROOT, "node_modules", "vize", "bin", "vize");
  let root = "";
  let violationsMap = new Map<string, number>();

  beforeAll(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "vize-entry-")));
    const fixtureDirectory = join(root, directory);
    mkdirSync(fixtureDirectory, { recursive: true });
    writeFileSync(
      join(root, "vite.config.mjs"),
      `export { default } from "${pathToFileURL(join(REPOSITORY_ROOT, "vite.config.ts")).href}";\n`,
    );
    const filePaths = fixtures.map(({ name, template }) => {
      const filePath = join(fixtureDirectory, `${name}.vue`);
      writeFileSync(filePath, `<template>\n  ${template}\n</template>\n`);
      return filePath;
    });
    const { stdout } = spawnSync(process.execPath, [VIZE_BINARY_PATH, "lint", "--format", "json", ...filePaths], {
      cwd: root,
      encoding: "utf8",
    });
    violationsMap = new Map(
      jsonDateParse<VizeLintReport[]>(stdout).map(({ file, messages }) => [
        basename(file, ".vue"),
        messages.filter(({ message }) => message.includes(messageStart)).length,
      ]),
    );
  });

  afterAll(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test.each(fixtures)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(violationsMap.get(name) ?? 0).toBe(violations);
  });
};

describe.todo("setupVizeEntrySuite");
