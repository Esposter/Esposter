import type { UnterminatedResult } from "#src/sweeps/unterminatedResults/models/UnterminatedResult";

import { scanCode } from "#src/sweeps/scanCode";

const ASYNC_NAME = "getResultAsync";
// The annotation is skipped rather than parsed, and the two characters that would carry the match out of the
// Declaration are the two a type may still spell: `=>` writes a function type, and a `;` separates an object
// Type's members. So both are readmitted in the only shapes a type holds them in — an arrow, and a braced group
const ANNOTATION_PATTERN = String.raw`(?::(?:[^;={}]|=>|\{(?:[^{}]|\{[^{}]*\})*\})*)?`;
// An identifier is not ASCII, so `\w` reads a longer name as the one it is only the tail of and misses one
// Whose own characters fall outside the range. `$` is legal in an identifier and is not `ID_Continue`
const IDENTIFIER_CONTINUE_CHARACTERS = String.raw`$\p{ID_Continue}`;
const IDENTIFIER_PATTERN = String.raw`[$\p{ID_Start}][${IDENTIFIER_CONTINUE_CHARACTERS}]*`;
const BINDING_REGEX = new RegExp(
  String.raw`\b(?:const|let|var)\s+(?<binding>${IDENTIFIER_PATTERN})\s*${ANNOTATION_PATTERN}=\s*$`,
  "u",
);
const CALL_REGEX = /getResult/gu;
const DOLLAR_REGEX = /\$/gu;
const IDENTIFIER_REGEX = new RegExp(`[${IDENTIFIER_CONTINUE_CHARACTERS}]`, "u");
const NAME = "getResult";
const PRECEDING_AWAIT_REGEX = /\bawait\s*$/u;
const PRECEDING_TRIVIA_REGEX = /(?:\s+|\/\*[\s\S]*?\*\/)+$/u;
const STATEMENT_START_REGEX = /[;{}]\s*$|^\s*$/u;
const TERMINATOR_NAMES = "andTee|andThen|mapErr|map|match|orElse|orTee|unwrapOr";
const TERMINATOR_REGEX = new RegExp(String.raw`^\s*\.(?:${TERMINATOR_NAMES})`, "u");
const TRIVIA_REGEX = /^(?:\s+|\/\/.*|\/\*[\s\S]*?\*\/)+/u;
const AFTER_LENGTH = 34;

// A terminator is a call, and `scanCode` drops the bracket, so in the code alone `.match(noop)` and
// `.matching(noop)` both read as `.match` followed by more identifier characters — no boundary written against
// The code can tell them apart. The source is where they separate, exactly as the call's own name is re-read
// There: `end` is one past the last token the name matched, so that token's index is where the source resumes.
const getIsCalled = (text: string, tokens: readonly (readonly [string, number, number])[], end: number): boolean => {
  const last = tokens[end - 1];
  if (!last) return false;

  return text
    .slice(last[2] + 1)
    .replace(TRIVIA_REGEX, "")
    .startsWith("(");
};

// A `Result` nothing terminates fails silently, and no line-anchored grep can see it: the terminator sits after
// The call's closing bracket, which is wherever its callback ends — and a fixed window around the call reports
// Every site whose body runs long. So the scan works over `scanCode`'s output rather than the raw text, which
// Buys both halves at once: a `getResult(` written inside a string or a comment is not code and never matches,
// And everything inside the call sits a bracket deeper, so the code back at the call's own depth is exactly
// What follows the `)`.
//
// The name is matched in the code and then re-read from the **source**, because `scanCode` drops the bracket:
// In the code alone `getResult(fn)` reads as `getResultfn`, so no lookahead can tell a call from a longer
// Identifier, and only the source says whether a `(` opens the argument list. Both edges of the name are read
// There: an identifier character before it means the match sits inside a longer name, and the `(` is looked for
// Past whatever whitespace or comment the source writes between the two, which is trivia to the grammar.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const tokens = [...scanCode(text)];
  const code = tokens.map(([character]) => character).join("");
  const results: UnterminatedResult[] = [];

  for (const match of code.matchAll(CALL_REGEX)) {
    const start = tokens[match.index];
    if (!start) continue;

    const previous = text[start[2] - 1];
    if (previous !== undefined && IDENTIFIER_REGEX.test(previous)) continue;

    const name = text.startsWith(ASYNC_NAME, start[2]) ? ASYNC_NAME : NAME;
    const afterName = text.slice(start[2] + name.length).replace(TRIVIA_REGEX, "");
    if (!afterName.startsWith("(")) continue;

    const afterTokens = tokens.slice(match.index + name.length).filter(([, depth]) => depth === start[1]);
    const afterCode = afterTokens.map(([character]) => character).join("");
    const after = afterCode.replaceAll(/\s+/gu, " ").trim().slice(0, AFTER_LENGTH);
    const terminator = TERMINATOR_REGEX.exec(afterCode);
    if (terminator && getIsCalled(text, afterTokens, terminator[0].length)) continue;

    // Where no terminator follows the call, whatever the call's value reaches owns it instead — so the code
    // Before the call decides, and only one of its shapes is still this file's to answer. A binding is
    // Terminated wherever its name is read, which is the repo's preferred spelling over nesting a long call
    // Inside its own terminator, so the name is looked up. Everywhere else the value leaves the statement —
    // Handed to `return`, to a combinator's callback, to another call's argument list — and the caller
    // Terminates it. What is left is a call standing alone as a statement, which is the silent drop.
    const before = text.slice(0, start[2]).replace(PRECEDING_TRIVIA_REGEX, "").replace(PRECEDING_AWAIT_REGEX, "");
    const { binding } = BINDING_REGEX.exec(before)?.groups ?? {};
    if (binding) {
      // The lookbehind is what makes this the binding rather than any property spelled the same: `\b` holds
      // After the dot in `other.result.match`, so it would read an unrelated object's field as the terminator
      // And clear a real finding. `$` is legal in an identifier and is an anchor in a pattern, so it is escaped
      // Rather than interpolated — unescaped it compiles to a regex that matches nothing at all. Every hit is
      // Walked rather than only the first, because one that turns out to be a longer property name does not
      // Rule out a real terminator further down.
      const escapedBinding = binding.replaceAll(DOLLAR_REGEX, (character) => `\\${character}`);
      const bindingRegex = new RegExp(
        String.raw`(?<![${IDENTIFIER_CONTINUE_CHARACTERS}.])${escapedBinding}\??\.(?:${TERMINATOR_NAMES})`,
        "gu",
      );
      const bindingTokens = tokens.slice(match.index);
      const bindingMatches = [...code.slice(match.index).matchAll(bindingRegex)];
      const isTerminated = bindingMatches.some((bindingMatch) =>
        getIsCalled(text, bindingTokens, bindingMatch.index + bindingMatch[0].length),
      );
      if (isTerminated) continue;
    } else if (!STATEMENT_START_REGEX.test(before)) continue;

    results.push({ after, line: text.slice(0, start[2]).split("\n").length });
  }

  return results;
};
