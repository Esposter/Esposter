// Split a command string into argv tokens, honouring single and double quotes. Minimal on purpose:
// It exists only so parseNodeInvocation can recognise simple `node -e <code>` forms. Returns undefined
// On an unbalanced quote, or on an unquoted shell control operator (pipe, redirect, subshell, …) that
// Needs a real shell — so the caller falls back to native rather than guessing at a broken command.
// Operators inside quotes are ordinary characters (e.g. `|` as a bitwise-or in the inline code).
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
