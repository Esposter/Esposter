import type { CodeToken } from "#src/models/sweeps/CodeToken";

// What a `/` follows when it opens a regex literal rather than divides: an operator, an opening bracket, a
// Separator, or nothing yet. The one-token lookbehind every JavaScript lexer settles for — `x / y / z` is a
// Division because `x` is an identifier, `(/y/)` a literal because `(` is not.
const REGEX_OPENER_REGEX = /(?:^|[=(,:[!&|?{};+\-*%<>~^]|\breturn|\btypeof|\bcase)\s*$/u;
// Enough of the tail to hold the longest opener keyword and the whitespace after it
const CODE_TAIL_LENGTH = 8;

const REGEX_FLAG_REGEX = /[a-z]/u;
// Every character of `text` that is real code, paired with its bracket depth and its index in `text`. Strings,
// Regex literals, template substitutions and both comment forms are skipped, so a `;` at depth 0 genuinely ends
// A declaration and a `;` inside a string or a `${…}` does not — a plain bracket count reads both the same and
// Mistakes where a statement stops. The index is what lets a caller match against the code alone and still
// Report a line.
export const scanCode = function* (text: string): Generator<CodeToken> {
  const stack: string[] = [];
  let quote = "";
  // The tail of the code so far — brackets and the closing delimiter of every skipped literal included, since
  // Both can end an expression — which is what says whether a `/` opens a regex literal
  let code = "";
  let index = 0;

  while (index < text.length) {
    const character = text[index];
    if (character === undefined) return;

    if (quote) {
      if (character === "\\") {
        index += 2;
        continue;
      }
      // A closed literal is an operand, so its delimiter joins the tail: without it the tail still ends with
      // Whatever preceded the literal, and `"a" / b` reads an opener there and swallows the rest of the line
      if (character === quote) {
        quote = "";
        code = `${code}${character}`.slice(-CODE_TAIL_LENGTH);
      }
    } else if (stack.at(-1) === "`") {
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === "`") {
        stack.pop();
        code = `${code}${character}`.slice(-CODE_TAIL_LENGTH);
      } else if (text.startsWith("${", index)) {
        stack.push("{");
        index += 2;
        continue;
      }
    } else if (character === '"' || character === "'") quote = character;
    else if (
      character === "/" &&
      !text.startsWith("//", index) &&
      !text.startsWith("/*", index) &&
      REGEX_OPENER_REGEX.test(code)
    ) {
      // A regex literal is skipped whole — its quotes and brackets are pattern, not code — up to the unescaped
      // `/` that closes it outside a character class, and through its flags
      let isInClass = false;
      index += 1;
      while (index < text.length) {
        const patternCharacter = text[index];
        if (patternCharacter === "\\") index += 2;
        else if (patternCharacter === "\n") break;
        else {
          index += 1;
          if (patternCharacter === "[") isInClass = true;
          else if (patternCharacter === "]") isInClass = false;
          else if (patternCharacter === "/" && !isInClass) break;
        }
      }
      while (index < text.length && REGEX_FLAG_REGEX.test(text[index] ?? "")) index += 1;
      code = `${code}/`.slice(-CODE_TAIL_LENGTH);
      continue;
    } else if (text.startsWith("//", index)) {
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
    } else if ("([{`".includes(character)) {
      stack.push(character);
      code = `${code}${character}`.slice(-CODE_TAIL_LENGTH);
    } else if (")]}".includes(character) && stack.length > 0) {
      stack.pop();
      code = `${code}${character}`.slice(-CODE_TAIL_LENGTH);
    } else {
      code = `${code}${character}`.slice(-CODE_TAIL_LENGTH);
      yield [character, stack.length, index];
    }

    index += 1;
  }
};
