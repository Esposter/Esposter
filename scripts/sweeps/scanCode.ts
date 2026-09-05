// Every character of `text` that is real code, paired with its bracket depth and its index in `text`. Strings,
// Template substitutions and both comment forms are skipped, so a `;` at depth 0 genuinely ends a declaration
// And a `;` inside a string or a `${…}` does not — a plain bracket count reads both the same and mistakes where
// A statement stops. The index is what lets a caller match against the code alone and still report a line.
export const scanCode = function* (text: string): Generator<readonly [string, number, number]> {
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
      const commentIndex = index;
      index = close === -1 ? text.length : close + 2;
      // A block comment separates the tokens on either side of it, so it leaves a space behind rather than
      // Nothing: `async/* note */function` must not rejoin as `asyncfunction` when a caller rebuilds the text.
      // A line comment needs none — the newline that ends it is code and is yielded on the next pass.
      yield [" ", stack.length, commentIndex];
      continue;
    } else if ("([{`".includes(character)) stack.push(character);
    else if (")]}".includes(character) && stack.length > 0) stack.pop();
    else yield [character, stack.length, index];

    index += 1;
  }
};
