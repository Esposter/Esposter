import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";

import { REPOSITORY_ROOT } from "#src/services/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const readSkillDocsFiles = (glob: string): SkillDocsFile[] =>
  getSweepFilePaths(glob).map((path) => ({ path, text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8") }));
