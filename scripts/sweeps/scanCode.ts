// Every character of `text` that is real code, paired with its bracket depth. Strings, template substitutions
// And both comment forms are skipped, so a `;` at depth 0 genuinely ends a declaration and a `;` inside a string
// Or a `${…}` does not — a plain bracket count reads both the same and mistakes where a statement stops.
export const scanCode = function* (text: string): Generator<readonly [string, number]> {
  const stack: string[] = [];
  let quote = "";
  let index = 0;

  while (index < text.length) {
    const character = text[index];
    if (character === undefined) return;

    if (quote) {
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === quote) quote = "";
    } else if (stack.at(-1) === "`") {
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === "`") stack.pop();
      else if (text.startsWith("${", index)) {
        stack.push("{");
        index += 2;
        continue;
      }
    } else if (character === '"' || character === "'") quote = character;
    else if (text.startsWith("//", index)) {
      const newline = text.indexOf("\n", index);
      index = newline === -1 ? text.length : newline;
      continue;
    } else if (text.startsWith("/*", index)) {
      const close = text.indexOf("*/", index);
      index = close === -1 ? text.length : close + 2;
      continue;
    } else if ("([{`".includes(character)) stack.push(character);
    else if (")]}".includes(character) && stack.length > 0) stack.pop();
    else yield [character, stack.length];

    index += 1;
  }
};
