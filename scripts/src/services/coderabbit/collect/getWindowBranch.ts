import { WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";

// The branch a window numbered `windowNumber` is pushed to
export const getWindowBranch = (windowNumber: number): string => `${WINDOW_BRANCH_PREFIX}${windowNumber.toString()}`;
