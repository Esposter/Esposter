// An open string or bracket runs on past the value's own end, through the rule's closing brace and over the rules after
// It, so every quote a value opens it closes, and every bracket outside a string. With backslashes refused there is no
// Escape to account for
export const checkIsBalancedStyleValue = (value: string) => {
  const openers: string[] = [];
  let quote = "";
  for (const character of value)
    if (quote) {
      if (character === quote) quote = "";
    } else if (character === '"' || character === "'") quote = character;
    else if (character === "(" || character === "[") openers.push(character);
    else if (character === ")" || character === "]") {
      if (openers.pop() !== (character === ")" ? "(" : "[")) return false;
    }
  return !quote && openers.length === 0;
};
