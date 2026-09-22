import type { FileOrganizationFinding } from "#src/models/sweeps/fileOrganization/FileOrganizationFinding";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getFileOrganizationFindings } from "#src/services/sweeps/fileOrganization/getFileOrganizationFindings";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
const SUITE_OR_DECLARATION_REGEX: RegExp = /\.(?:test|test-d|bench|d)\.ts$/u;

// Every source file the file-organization ledger's scope names, scanned. Suites and benches are the testing and
// Test-values ledgers' to read, an ambient declaration mirrors a library's shapes, and generated output is
// Machine state, so none of them is a candidate.
export const readFileOrganizationFindings = (): FileOrganizationFinding[] =>
  readSweepFilePaths("apps/*.ts", "apps/*.vue", "packages/*.ts", "packages/*.vue", "scripts/*.ts")
    .filter(
      (path) =>
        !SUITE_OR_DECLARATION_REGEX.test(path) &&
        !path.includes("/dist/") &&
        !path.includes("/generated/") &&
        !path.includes("/.output/"),
    )
    .flatMap((path) => getFileOrganizationFindings(path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")));
