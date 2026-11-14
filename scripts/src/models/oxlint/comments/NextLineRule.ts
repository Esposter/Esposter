import type { NextLineDirective } from "#src/models/oxlint/comments/NextLineDirective";

// Every next-line disable of one rule under one linter's prefix, in source order.
export interface NextLineRule {
  directives: NextLineDirective[];
  prefix: string;
  rule: string;
}
