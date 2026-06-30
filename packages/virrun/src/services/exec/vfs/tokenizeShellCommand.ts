// Split a command string into argv tokens, honouring quotes. Minimal on purpose: only enough for
// ParseNodeInvocation. Returns undefined on an unbalanced quote or an unquoted shell control operator (which needs
// A real shell), so the caller falls back to native. Operators inside quotes are ordinary characters.
const SHELL_OPERATORS = new Set(["$", "&", "(", ")", ";", "<", ">", "`", "|"]);

export const tokenizeShellCommand = (input: string): string[] | undefined => {
  const tokens: string[] = [];
  let current = "";
  let quote = "";
  let hasToken = false;
  for (const char of input) {
    if (quote !== "") {
      if (char === quote) quote = "";
      else current += char;
      continue;
    }
    if (SHELL_OPERATORS.has(char)) return undefined;
    if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;
      continue;
    }
    if (char === " " || char === "\t") {
      if (hasToken) {
        tokens.push(current);
        current = "";
        hasToken = false;
      }
      continue;
    }
    current += char;
    hasToken = true;
  }
  if (quote !== "") return undefined;
  if (hasToken) tokens.push(current);
  return tokens;
};
