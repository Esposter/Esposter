import { readBaseBranches } from "#src/services/coderabbit/collect/readBaseBranches";

// CodeRabbit reviews a pull request only when its base is the default branch, unless `base_branches` lists more. A window
// Stacked on another is based on that window, so the guard holds only when the list reaches the base the window is cut
// Over. The caller passes that base's copy of the file, the one the window's review reads
export const checkIsStackingAllowed = (coderabbitYamlText: string, baseBranch: string): boolean =>
  readBaseBranches(coderabbitYamlText).some((pattern) => new RegExp(pattern, "u").test(baseBranch));
