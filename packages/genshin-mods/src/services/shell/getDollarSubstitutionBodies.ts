// The bodies of a command's `$(…)` substitutions, which run even inside double quotes.
// Each runs to the parenthesis closing it, past any quote or backslash it holds, so a body such as
// `find / -name '(x)'` is read whole.
// A substitution inside a body is the body's own, read when the body is.
export const getDollarSubstitutionBodies = (command: string): string[] => {
  const bodies: string[] = [];
  let start = command.indexOf("$(");
  while (start !== -1) {
    let depth = 1;
    let quote = "";
    let index = start + 2;
    for (; index < command.length && depth > 0; index++) {
      const character = command[index];
      if (character === "\\" && quote !== "'") index++;
      // The shell parser holds a quote, so a quote character inside one is text, not a token.
      // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a quote the shell parser holds, not a token
      else if (quote !== "") {
        if (character === quote) quote = "";
      } else if (character === '"' || character === "'") quote = character;
      else if (character === "(") depth++;
      else if (character === ")") depth--;
    }
    if (depth > 0) break;
    bodies.push(command.slice(start + 2, index - 1));
    start = command.indexOf("$(", index);
  }
  return bodies;
};
