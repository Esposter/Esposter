import type { Comment } from "@oxlint/plugins";

import { SENTENCE_END_REGEX } from "#src/services/oxlint/comments/constants";

// A `//` line carrying on a sentence the `//` line directly above it left open. A sentence start is left alone:
// There a capitalised proper name (`GrapesJS`, imported as `grapesJS`) reads the same as a corrupted identifier
export const checkIsContinuation = (previous: Comment | undefined, comment: Comment): boolean =>
  comment.type === "Line" &&
  previous?.type === "Line" &&
  previous.loc.end.line === comment.loc.start.line - 1 &&
  !SENTENCE_END_REGEX.test(previous.value);
