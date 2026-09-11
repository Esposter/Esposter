// Split a command string into argv tokens, honouring quotes. Minimal on purpose: only enough for
// ParseNodeInvocation. Returns undefined on an unbalanced quote or an unquoted shell control operator (which needs
// A real shell), so the caller falls back to native. Operators inside quotes are ordinary characters.
const SHELL_OPERATORS = new Set(["$", "&", "(", ")", ";", "<", ">", "`", "|"]);

export const tokenizeShellCommand = (input: string): string[] | undefined => {
  const tokens: string[] = [];
  let current = "";
  let quote = "";
  let hasToken = false;
  for (const character of input) {
    if (quote) {
      if (character === quote) quote = "";
      else current += character;
      continue;
    }
    if (SHELL_OPERATORS.has(character)) return undefined;
    if (character === '"' || character === "'") {
      quote = character;
      hasToken = true;
      continue;
    }
    if (character === " " || character === "\t") {
      if (hasToken) {
        tokens.push(current);
        current = "";
        hasToken = false;
      }
      continue;
    }
    current += character;
    hasToken = true;
  }
  if (quote) return undefined;
  if (hasToken) tokens.push(current);
  return tokens;
};
