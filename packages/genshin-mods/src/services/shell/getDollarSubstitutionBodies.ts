// The bodies of a command's `$(…)` substitutions, which run even inside double quotes: each runs to the parenthesis
// Closing it, past any a quote or a backslash holds, so a body such as `find / -name '(x)'` is read whole. A
// Substitution inside a body is the body's own, read when the body is
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
