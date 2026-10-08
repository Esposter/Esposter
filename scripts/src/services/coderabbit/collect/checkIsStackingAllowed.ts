import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { readBaseBranches } from "#src/services/coderabbit/collect/readBaseBranches";

// CodeRabbit reviews a pull request only when its base is the default branch, unless `base_branches` lists more. A
// window stacked on another is based on that window, so the guard holds only when the list reaches the first window's
// branch. The caller passes `main`'s copy of the file, the one the pass is written against
export const checkIsStackingAllowed = (coderabbitYamlText: string): boolean => {
  const firstWindowBranch = getWindowBranch(1);
  return readBaseBranches(coderabbitYamlText).some((pattern) => new RegExp(pattern, "u").test(firstWindowBranch));
};
