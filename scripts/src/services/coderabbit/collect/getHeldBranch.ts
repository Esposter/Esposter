import { HELD_BRANCH_PREFIX, HELD_SHORT_SHA_LENGTH } from "#src/services/coderabbit/collect/constants";

export const getHeldBranch = (sha: string): string => `${HELD_BRANCH_PREFIX}${sha.slice(0, HELD_SHORT_SHA_LENGTH)}`;
