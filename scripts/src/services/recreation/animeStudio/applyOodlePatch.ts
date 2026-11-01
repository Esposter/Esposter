import { checkIsOodlePatchPending } from "#src/services/recreation/animeStudio/checkIsOodlePatchPending";
import { checkIsPatchApplicable } from "#src/services/recreation/animeStudio/checkIsPatchApplicable";
import { OODLE_HELPER_PATCH_PATH } from "#src/services/recreation/animeStudio/constants";
import { run } from "#src/services/recreation/animeStudio/run";

// The Oodle patch goes into the checked-out tree unless the tree already carries it, so a rebuild over one is idempotent
export const applyOodlePatch = (directory: string): void => {
  const isPending = checkIsOodlePatchPending({
    appliesForward: checkIsPatchApplicable(directory, OODLE_HELPER_PATCH_PATH),
    appliesReverse: checkIsPatchApplicable(directory, OODLE_HELPER_PATCH_PATH, "--reverse"),
  });
  if (isPending) run("git", ["apply", OODLE_HELPER_PATCH_PATH], directory);
};
