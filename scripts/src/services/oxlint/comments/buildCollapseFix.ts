import type { NextLineDirective } from "#src/models/oxlint/comments/NextLineDirective";
import type { NextLineRule } from "#src/models/oxlint/comments/NextLineRule";
import type { Comment, Fix, Fixer, Range } from "@oxlint/plugins";

import { buildRuleKey } from "#src/services/oxlint/comments/buildRuleKey";
import { BACK_REFERENCE_REASON_REGEX } from "#src/services/oxlint/comments/constants";

// One fix for the whole file: each repeated rule's next-line disables go, and one file-level directive per rule takes
// Their place at the top, after a shebang. Every report of the file carries this same fix, and oxlint keeps the first.
// A combined directive keeps the rules it names that did not repeat, so it is rewritten rather than removed.
export const buildCollapseFix = (fixer: Fixer, sourceText: string, repeated: NextLineRule[]): Fix[] => {
  const repeatedKeys = new Set(repeated.map(({ prefix, rule }) => buildRuleKey(prefix, rule)));
  const uniqueDirectives = new Set(repeated.flatMap((group) => group.directives));
  const edits: Fix[] = [];
  for (const directive of uniqueDirectives) {
    const remainingRules = directive.rules.filter((rule) => !repeatedKeys.has(buildRuleKey(directive.prefix, rule)));
    edits.push(
      remainingRules.length === 0
        ? { range: getLineRange(sourceText, directive.comment), text: "" }
        : { range: directive.comment.range, text: buildDirectiveText(directive, remainingRules) },
    );
  }

  const insertAt = sourceText.startsWith("#!") ? sourceText.indexOf("\n") + 1 : 0;
  const fileDirectives = `${repeated.map((group) => buildFileDirective(group)).join("\n")}\n`;
  const edit = edits.find(({ range: [start] }) => start === insertAt);
  if (edit) edit.text = fileDirectives + edit.text;
  else edits.push({ range: [insertAt, insertAt], text: fileDirectives });

  return edits
    .toSorted((firstEdit, secondEdit) => firstEdit.range[0] - secondEdit.range[0])
    .map(({ range, text }) => fixer.replaceTextRange(range, text));
};

// The whole line a directive stands alone on, so removing it leaves no blank line behind. A trailing one goes alone.
const getLineRange = (sourceText: string, comment: Comment): Range => {
  const [start, end] = comment.range;
  const lineStart = sourceText.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = sourceText.indexOf("\n", end);
  const isStandalone = sourceText.slice(lineStart, start).trim() === "";
  return isStandalone ? [lineStart, lineEnd === -1 ? sourceText.length : lineEnd + 1] : [start, end];
};

const buildDirectiveText = ({ comment, head, tail }: NextLineDirective, rules: string[]): string => {
  const isBlock = comment.type === "Block";
  return `${isBlock ? "/*" : "//"}${head} ${rules.join(", ")}${tail}${isBlock ? "*/" : ""}`;
};

// The file-level directive a repeated rule collapses to, with each distinct reason its directives gave in source order.
// A reason that only points at the one above it is dropped, since the directive above is in the file-level reason.
const buildFileDirective = ({ directives, prefix, rule }: NextLineRule): string => {
  const reasons = new Set(
    directives
      .map(({ reason }) => reason)
      .filter((reason) => reason !== "" && !BACK_REFERENCE_REASON_REGEX.test(reason)),
  );
  const directive = `/* ${prefix}-disable ${rule}`;
  return reasons.size === 0 ? `${directive} */` : `${directive} -- ${[...reasons].join("; ")} */`;
};
