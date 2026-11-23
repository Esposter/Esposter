import type { UnitSize } from "#src/models/sweeps/ledgerCoverage/UnitSize";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BINARY_BYTE } from "#src/services/sweeps/constants";
import { checkHoldsBinaryByte } from "#src/services/sweeps/ledgerCoverage/checkHoldsBinaryByte";
import { UNIT_CODE_FILE_REGEX } from "#src/services/sweeps/ledgerCoverage/constants";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// One tracked file's share of its unit's size, read from the working tree. A binary file is no file a pass reads, and a
// Symlink names what it points at, so `.claude` holds no file of its own. A file the index tracks but the working tree
// No longer holds, a deletion not staged yet, weighs nothing either. Only a code file's lines are counted, so any other
// File is checked for a NUL byte and no more
export const readFileSize = (file: string): UnitSize => {
  const path = join(REPOSITORY_ROOT, file);
  if (!existsSync(path) || !statSync(path).isFile()) return { files: 0, lines: 0 };
  if (!UNIT_CODE_FILE_REGEX.test(file)) return { files: checkHoldsBinaryByte(path) ? 0 : 1, lines: 0 };

  const contents = readFileSync(path);
  if (contents.includes(BINARY_BYTE)) return { files: 0, lines: 0 };

  return { files: 1, lines: contents.toString("utf8").split("\n").length - 1 };
};
