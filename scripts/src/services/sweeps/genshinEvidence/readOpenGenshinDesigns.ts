import { readWorkingTreeFiles } from "#src/services/shared/readWorkingTreeFiles";
import { checkIsOpenGenshinDesign } from "#src/services/sweeps/genshinEvidence/checkIsOpenGenshinDesign";

// Every genshin spec folder's design, read whole, so a folder is open when its design is
export const readOpenGenshinDesigns = (): string[] =>
  readWorkingTreeFiles("openspec/specs/genshin/*/design.md")
    .filter((file) => checkIsOpenGenshinDesign(file.text))
    .map((file) => file.path);
