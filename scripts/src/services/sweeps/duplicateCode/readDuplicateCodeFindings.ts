import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";
import type { detectClones as DetectClones } from "jscpd";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import {
  DUPLICATE_CODE_FORMATS,
  DUPLICATE_CODE_IGNORED_GLOBS,
  DUPLICATE_CODE_SCOPES,
  MIN_DUPLICATE_LINES,
  MIN_DUPLICATE_TOKENS,
} from "#src/services/sweeps/duplicateCode/constants";
import { getDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindings";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, sep } from "node:path";

// jscpd's ESM build imports `colors/safe` by name, which Node cannot read off that CommonJS module, so the package is
// Loaded through its `require` entry, which exposes the same API. The types come from the ESM declarations above.
const require = createRequire(import.meta.url);
// oxlint-disable-next-line typescript/no-unsafe-assignment -- the `require` entry is untyped, and the type is taken from the declarations above
const { detectClones }: { detectClones: typeof DetectClones } = require("jscpd");

// The scan runs in memory with no reporter, so it writes nothing to disk and prints nothing of jscpd's own. Its paths
// Are forward-slashed, since jscpd finds no file under a Windows backslash path and reports zero clones without an error.
export const readDuplicateCodeFindings = async (): Promise<DuplicateCodeFinding[]> => {
  const clones = await detectClones({
    format: DUPLICATE_CODE_FORMATS,
    ignore: DUPLICATE_CODE_IGNORED_GLOBS,
    minLines: MIN_DUPLICATE_LINES,
    minTokens: MIN_DUPLICATE_TOKENS,
    path: DUPLICATE_CODE_SCOPES.map((scope) => resolve(REPOSITORY_ROOT, scope).split(sep).join("/")),
    reporters: [],
    silent: true,
  });
  return getDuplicateCodeFindings(clones, (sourceId) => readFileSync(sourceId, "utf8"));
};
