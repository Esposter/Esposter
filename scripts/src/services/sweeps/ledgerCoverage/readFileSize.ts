import type { UnitSize } from "#src/models/sweeps/ledgerCoverage/UnitSize";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BINARY_BYTE } from "#src/services/sweeps/constants";
import { UNIT_CODE_FILE_REGEX } from "#src/services/sweeps/ledgerCoverage/constants";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// One tracked file's share of its unit's size, read from the working tree. A binary file is no file a pass reads, and a
// Symlink names what it points at, so `.claude` holds no file of its own
export const readFileSize = (file: string): UnitSize => {
  const path = join(REPOSITORY_ROOT, file);
  if (!statSync(path).isFile()) return { files: 0, lines: 0 };

  const contents = readFileSync(path);
  if (contents.includes(BINARY_BYTE)) return { files: 0, lines: 0 };

  return { files: 1, lines: UNIT_CODE_FILE_REGEX.test(file) ? contents.toString("utf8").split("\n").length - 1 : 0 };
};
