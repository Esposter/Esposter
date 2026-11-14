import type { Comment } from "@oxlint/plugins";

// A next-line disable of either linter, with the rules its list names. `head` and `tail` keep the text around the list
// As written, so a rewrite that drops a rule leaves the directive's reason exactly as it was.
export interface NextLineDirective {
  comment: Comment;
  head: string;
  prefix: string;
  reason: string;
  rules: string[];
  tail: string;
}
