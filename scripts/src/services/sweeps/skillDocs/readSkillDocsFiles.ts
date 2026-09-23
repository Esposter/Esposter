import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const readSkillDocsFiles = (glob: string): SkillDocsFile[] =>
  readSweepFilePaths(glob).map((path) => ({ path, text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8") }));
