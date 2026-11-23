import type { DependencyField } from "#src/models/shared/DependencyField";

import { DEPENDENCY_FIELDS } from "#src/models/shared/DependencyField";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readRepositoryFile } from "#src/workspace/readRepositoryFile.test";
import { spawnSync } from "@esposter/shared-node/child-process";
import { matchesGlob } from "node:path";
import { describe, expect, test } from "vitest";

type Manifest = Partial<Record<DependencyField, Record<string, string>>>;

const CODE_PATHSPECS = ["*.cjs", "*.cts", "*.js", "*.mjs", "*.mts", "*.ts", "*.tsx", "*.vue"];
// Unimport writes an ESLint header into the declarations it generates on every run, so no edit keeps it out. oxlint
// Already ignores these files, and no other tracked file is generated
const GENERATED_FILE_PATTERN = "**/auto-imports.d.ts";
const ESLINT_DIRECTIVE_REGEX = /(?:\/\/|\/\*|<!--)\s*eslint-(?:disable|enable)/u;
const CLASSIC_COMPILER = "typescript";
const IMPORTERS_SECTION_REGEX = /^importers:\n[\s\S]*?(?=^\S|(?![\s\S]))/gmu;

describe("lintToolchain", () => {
  test("linting the whole repository", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readSweepFilePaths("*eslint.config.*")).toStrictEqual([]);
    expect(
      readSweepFilePaths(...CODE_PATHSPECS)
        .filter((path) => !matchesGlob(path, GENERATED_FILE_PATTERN))
        .filter((path) => ESLINT_DIRECTIVE_REGEX.test(readRepositoryFile(path))),
    ).toStrictEqual([]);
  });

  test("linting a workspace with no classic compiler", () => {
    expect.hasAssertions();

    const manifestListings = readSweepFilePaths("*package.json").flatMap((path) => {
      const manifest = parseMachineJson<Manifest>(readRepositoryFile(path));
      return DEPENDENCY_FIELDS.filter((field) => manifest[field]?.[CLASSIC_COMPILER] !== undefined).map(
        (field) => `${path} ${field}`,
      );
    });
    // The lockfile is one YAML document per install, each with its own importers section listing every workspace package's
    // Dependencies. A section runs from its key to the next line at column zero, or the end of the file
    const lockfile = readRepositoryFile("pnpm-lock.yaml");
    const importers = lockfile.match(IMPORTERS_SECTION_REGEX) ?? [];

    expect(manifestListings).toStrictEqual([]);
    expect(readRepositoryFile("pnpm-workspace.yaml")).not.toMatch(/^ {2}typescript:/mu);
    expect(importers.length).toBeGreaterThan(0);
    expect(importers.join("\n")).not.toMatch(/^ {6}typescript:/mu);
  });

  test("a lint tool that needs the classic compiler", () => {
    expect.hasAssertions();

    // A lint tool that loads the classic compiler fails on a module it cannot find, and the failure names that module.
    // The probe is a fresh process started in the workspace with NODE_PATH cleared: vitest's workers point NODE_PATH at
    // Their own dependency folders, which would resolve the compiler from there
    const probe = spawnSync(process.execPath, ["-e", `require("${CLASSIC_COMPILER}")`], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      env: { ...process.env, NODE_PATH: "" },
    });

    expect(probe.status).not.toBe(0);
    expect(probe.stderr).toContain(`'${CLASSIC_COMPILER}'`);
  });
});
