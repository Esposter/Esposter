import { readYamlBlock } from "#src/services/coderabbit/collect/readYamlBlock";
import { readYamlList } from "#src/services/coderabbit/collect/readYamlList";

// The regexes `reviews.auto_review.base_branches` lists, read from the file's own lines. The key is read inside the
// `auto_review` block alone, so a `base_branches` elsewhere in the file lists nothing.
export const readBaseBranches = (coderabbitYamlText: string): string[] =>
  readYamlList(readYamlBlock(coderabbitYamlText.split("\n"), "auto_review"), "base_branches");
