import { countParentheses } from "#src/services/genshinAssets/kits/gcsim/countParentheses";

// The most lines an area's constructor may run across, its arguments on the lines under its opening line
const MAX_CONSTRUCTOR_LINES = 12;

// The constructor on a line with the lines its arguments run on, up to the parenthesis that closes it
export const readConstructorText = (lines: readonly string[], lineIndex: number): string => {
  let text = lines[lineIndex] ?? "";
  let depth = countParentheses(text, "(") - countParentheses(text, ")");
  for (
    let next = lineIndex + 1;
    depth > 0 && next < lines.length && next <= lineIndex + MAX_CONSTRUCTOR_LINES;
    next++
  ) {
    const line = lines[next] ?? "";
    text += `\n${line}`;
    depth += countParentheses(line, "(") - countParentheses(line, ")");
  }
  return text;
};
