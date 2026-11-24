import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// Each vendored skill's folder with its trailing slash, so a path is tested against it by prefix
export const readVendoredSkillDirectories = (): string[] =>
  readVendoredSkillNames().map((name) => `${SKILLS_DIRECTORY}/${name}/`);
