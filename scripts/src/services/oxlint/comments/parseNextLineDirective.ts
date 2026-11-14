import type { NextLineDirective } from "#src/models/oxlint/comments/NextLineDirective";
import type { Comment } from "@oxlint/plugins";

import { NEXT_LINE_DIRECTIVE_REGEX } from "#src/services/oxlint/comments/constants";

// A bare directive names no rule, so there is no rule to collapse and it is not read as one.
export const parseNextLineDirective = (comment: Comment): NextLineDirective | undefined => {
  const groups = NEXT_LINE_DIRECTIVE_REGEX.exec(comment.value)?.groups;
  if (!groups) return undefined;

  const rules = (groups.rules ?? "")
    .split(",")
    .map((rule) => rule.trim())
    .filter((rule) => rule !== "");
  if (rules.length === 0) return undefined;

  return {
    comment,
    head: groups.head ?? "",
    prefix: groups.prefix ?? "",
    reason: (groups.reason ?? "").trim(),
    rules,
    tail: groups.tail ?? "",
  };
};
