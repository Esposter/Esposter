import type { DuplicateCodeClone } from "#src/models/sweeps/duplicateCode/DuplicateCodeClone";
import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";
import type { DuplicateCodeFragment } from "#src/models/sweeps/duplicateCode/DuplicateCodeFragment";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import {
  DUPLICATE_CODE_FORMATS,
  DUPLICATE_CODE_IGNORED_GLOBS,
  DUPLICATE_CODE_SCOPES,
  MIN_DUPLICATE_LINES,
  MIN_DUPLICATE_TOKENS,
} from "#src/services/sweeps/duplicateCode/constants";
import { getDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindings";
import { getPluginRoot } from "#src/services/sweeps/duplicateCode/getPluginRoot";
import { InvalidOperationError, jsonDateParse, Operation, withFinalizer } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

interface JscpdReport {
  duplicates: { firstFile: JscpdReportFragment; format: string; secondFile: JscpdReportFragment }[];
}

interface JscpdReportFragment {
  end: number;
  name: string;
  start: number;
}

// The `jscpd` package is the Rust engine's launcher, with no JavaScript API, so the scan runs as its command line and
// Reads the JSON report it writes. The launcher picks the platform binary, and `--absolute` keeps every fragment's name
// The absolute path the finder relates to the repository root.
const JSCPD_LAUNCHER = createRequire(import.meta.url).resolve("jscpd/run-jscpd.js");

// A fragment's name is its path, behind Windows' verbatim `\\?\` prefix, and a Vue file's name ends in `:` and the
// Format its script was read as. A drive's `:` is never followed by letters, so the suffix matches only the format.
const WINDOWS_VERBATIM_PREFIX_REGEX = /^\\\\\?\\/u;
const FORMAT_SUFFIX_REGEX = /:[a-z]+$/u;
const getSourceId = ({ name }: JscpdReportFragment) =>
  name.replace(WINDOWS_VERBATIM_PREFIX_REGEX, "").replace(FORMAT_SUFFIX_REGEX, "");

const toDuplicateCodeFragment = (fragment: JscpdReportFragment): DuplicateCodeFragment => ({
  end: { line: fragment.end },
  sourceId: getSourceId(fragment),
  start: { line: fragment.start },
});

// The JSON report goes into a temporary directory that is removed once it is read, so the scan leaves nothing behind.
export const readDuplicateCodeFindings = (): DuplicateCodeFinding[] => {
  const outputDirectory = mkdtempSync(join(tmpdir(), "duplicate-code-"));
  const scopes = DUPLICATE_CODE_SCOPES.map((scope) => resolve(REPOSITORY_ROOT, scope).split(sep).join("/"));
  const result = spawnSync(
    process.execPath,
    [
      JSCPD_LAUNCHER,
      ...scopes,
      "--absolute",
      "--format",
      DUPLICATE_CODE_FORMATS.join(","),
      "--ignore",
      DUPLICATE_CODE_IGNORED_GLOBS.join(","),
      "--min-lines",
      String(MIN_DUPLICATE_LINES),
      "--min-tokens",
      String(MIN_DUPLICATE_TOKENS),
      "--no-gitignore",
      "--no-tips",
      "--output",
      outputDirectory,
      "--reporters",
      "json",
      "--silent",
      // jscpd exits non-zero over `.jscpd.json`'s threshold, counting the raw clones; the finder reads every clone and
      // filters them itself, so a clone the filter keeps is the one to fail on, not the launcher's exit
      "--threshold",
      "100",
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    rmSync(outputDirectory, { force: true, recursive: true });
    // A launcher that never ran or was killed has no output, so its spawn error or signal is the only detail it leaves
    throw new InvalidOperationError(
      Operation.Read,
      "jscpd",
      result.stderr || result.stdout || result.error?.message || result.signal || "",
    );
  }

  const report = withFinalizer(
    () => jsonDateParse<JscpdReport>(readFileSync(join(outputDirectory, "jscpd-report.json"), "utf8")),
    () => rmSync(outputDirectory, { force: true, recursive: true }),
  );
  const clones: DuplicateCodeClone[] = report.duplicates.map(({ firstFile, secondFile }) => ({
    duplicationA: toDuplicateCodeFragment(firstFile),
    duplicationB: toDuplicateCodeFragment(secondFile),
  }));
  return getDuplicateCodeFindings(clones, (sourceId) => readFileSync(sourceId, "utf8"), getPluginRoot);
};
