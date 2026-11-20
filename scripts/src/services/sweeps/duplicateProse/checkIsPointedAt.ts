import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { WORD_AND_HYPHEN_NAME_REGEX } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";

// A backticked repo path names one page; a backticked skill name names every page of that skill, since the
// Argument a line points at may sit in the `SKILL.md` or in any of its reference pages
export const checkIsPointedAt = (line: string, path: string): boolean =>
  getBacktickedTokens(line).some(
    (token) =>
      token === path || (WORD_AND_HYPHEN_NAME_REGEX.test(token) && path.startsWith(`${SKILLS_DIRECTORY}/${token}/`)),
  );
