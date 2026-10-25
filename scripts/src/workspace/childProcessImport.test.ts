import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface OxlintDiagnostic {
  code: string;
  help: string;
  message: string;
}

/**
 * The child process ban is written twice in `oxlint.config.ts`: a value import of either spelling of node's module is
 * restricted outside the wrappers. The probe lives outside the repo, so the root pass never lints it, and it is linted
 * with the repo's own config, so the test reads the entries as they are rather than a copy of them.
 */
describe("childProcessImport", () => {
  const OXLINT_BIN = join(REPOSITORY_ROOT, "node_modules", "oxlint", "bin", "oxlint");
  const OXLINT_CONFIG = join(REPOSITORY_ROOT, "oxlint.config.ts");
  const PROBE_FILENAME = "probe.ts";
  const RESTRICTED_IMPORT_CODE = "eslint(no-restricted-imports)";
  const WRAPPERS_IMPORT_PATH = "@esposter/shared-node/child-process";
  // Both spellings of node's module as a value import, so each of the two banned entries has to fire on its own
  const PROBE_SOURCE = [
    'import { execFile } from "child_process";',
    'import { spawn } from "node:child_process";',
    "",
    "export const children = [execFile, spawn];",
    "",
  ].join("\n");

  let diagnostics: OxlintDiagnostic[] = [];
  let directory = "";

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "child-process-import-"));
    writeFileSync(join(directory, PROBE_FILENAME), PROBE_SOURCE);

    const { stdout, status, stderr } = spawnSync(
      process.execPath,
      [
        OXLINT_BIN,
        "--config",
        OXLINT_CONFIG,
        "--format=json",
        "--disable-nested-config",
        join(directory, PROBE_FILENAME),
      ],
      { encoding: "utf8" },
    );
    if (!stdout)
      throw new InvalidOperationError(
        Operation.Read,
        OXLINT_CONFIG,
        `oxlint produced no output (status ${status}): ${stderr}`,
      );

    diagnostics = jsonDateParse<{ diagnostics: OxlintDiagnostic[] }>(stdout).diagnostics.filter(
      ({ code }) => code === RESTRICTED_IMPORT_CODE,
    );
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("a direct import of node's child process fails lint", () => {
    expect.hasAssertions();

    expect(diagnostics.map(({ message }) => message).toSorted()).toStrictEqual([
      "'child_process' import is restricted from being used.",
      "'node:child_process' import is restricted from being used.",
    ]);
    expect(diagnostics.map(({ help }) => help)).toStrictEqual(
      diagnostics.map(() => expect.stringContaining(WRAPPERS_IMPORT_PATH)),
    );
  });
});
