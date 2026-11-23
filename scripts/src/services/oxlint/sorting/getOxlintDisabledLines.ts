import type { Context } from "@oxlint/plugins";

import { checkIsRuleCovered } from "#src/services/oxlint/sorting/getOxlintDisabledLines/checkIsRuleCovered";
import { parseOxlintDirective } from "#src/services/oxlint/sorting/parseOxlintDirective";

// The lines a directive for the rule disables: its own line, or the line below it for a next-line one.
// A block disables the lines after it up to its enable, or to the end of the file when it is never enabled.
export const getOxlintDisabledLines = (context: Context, ruleName: string): Set<number> => {
  const disabledLines = new Set<number>();
  const addBlockLines = (disabledFromLine: number, lastLine: number): void => {
    for (let line = disabledFromLine + 1; line <= lastLine; line++) disabledLines.add(line);
  };
  let disabledFromLine: number | undefined;
  for (const comment of context.sourceCode.getAllComments()) {
    const directive = parseOxlintDirective(comment.value);
    if (directive === undefined || !checkIsRuleCovered(directive.rules, ruleName)) continue;
    switch (directive.directive) {
      case "oxlint-disable":
        disabledFromLine ??= comment.loc.start.line;
        break;
      case "oxlint-disable-line":
        disabledLines.add(comment.loc.start.line);
        break;
      case "oxlint-disable-next-line":
        disabledLines.add(comment.loc.end.line + 1);
        break;
      case "oxlint-enable":
        if (disabledFromLine !== undefined) {
          addBlockLines(disabledFromLine, comment.loc.start.line);
          disabledFromLine = undefined;
        }
        break;
      default:
        break;
    }
  }
  if (disabledFromLine !== undefined) addBlockLines(disabledFromLine, context.sourceCode.lines.length);
  return disabledLines;
};
