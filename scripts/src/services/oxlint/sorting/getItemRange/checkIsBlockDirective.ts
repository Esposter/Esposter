import type { Comment } from "@oxlint/plugins";

import { parseOxlintDirective } from "#src/services/oxlint/sorting/parseOxlintDirective";

// A block directive governs the code below it through its enable, so it stays where it is rather than moving with an item
export const checkIsBlockDirective = (comment: Comment): boolean => {
  const directive = parseOxlintDirective(comment.value)?.directive;
  return directive === "oxlint-disable" || directive === "oxlint-enable";
};
