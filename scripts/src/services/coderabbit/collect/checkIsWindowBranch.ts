import { WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";

// A window's head is the window prefix and its number, and nothing else. A branch under the prefix that anyone named
// Otherwise is no window: the stack would merge it on the bot's completed review.
export const checkIsWindowBranch = (headRefName: string): boolean =>
  headRefName.startsWith(WINDOW_BRANCH_PREFIX) && /^\d+$/u.test(headRefName.slice(WINDOW_BRANCH_PREFIX.length));
