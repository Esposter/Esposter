import type { NextLineRule } from "#src/models/oxlint/comments/NextLineRule";
import type { Comment } from "@oxlint/plugins";

import { buildRuleKey } from "#src/services/oxlint/comments/buildRuleKey";
import { parseNextLineDirective } from "#src/services/oxlint/comments/parseNextLineDirective";

// A combined directive counts once for each rule it names, so `a, b` is one occurrence of `a` and one of `b`.
export const groupNextLineRules = (comments: Comment[]): Map<string, NextLineRule> => {
  const groups = new Map<string, NextLineRule>();
  for (const comment of comments) {
    const directive = parseNextLineDirective(comment);
    if (!directive) continue;

    for (const rule of directive.rules) {
      const key = buildRuleKey(directive.prefix, rule);
      const group: NextLineRule = groups.get(key) ?? { directives: [], prefix: directive.prefix, rule };
      group.directives.push(directive);
      groups.set(key, group);
    }
  }
  return groups;
};
