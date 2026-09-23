import type { SkillsLock } from "#src/models/sweeps/SkillsLock";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { SKILLS_LOCK_FILE } from "#src/services/sweeps/constants";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// Read off the filesystem, like the skills ledger's listing, so it answers inside virrun's overlay too. A tree with
// No vendored skill has no lock file at all
export const readVendoredSkillNames = (): string[] => {
  const skillsLockPath = join(REPOSITORY_ROOT, SKILLS_LOCK_FILE);
  return existsSync(skillsLockPath)
    ? Object.keys(parseMachineJson<SkillsLock>(readFileSync(skillsLockPath, "utf8")).skills)
    : [];
};
