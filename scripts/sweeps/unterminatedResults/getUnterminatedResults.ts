import type { UnterminatedResult } from "#scripts/sweeps/unterminatedResults/models/UnterminatedResult";

import { scanCode } from "#scripts/sweeps/scanCode";

const ASYNC_NAME = "getResultAsync";
const BINDING_REGEX = /\b(?:const|let|var)\s+(?<binding>[$A-Z_a-z][$\w]*)\s*=\s*$/u;
const CALL_REGEX = /getResult/gu;
const IDENTIFIER_REGEX = /[$\p{ID_Continue}]/u;
const NAME = "getResult";
const PRECEDING_AWAIT_REGEX = /\bawait\s*$/u;
const PRECEDING_TRIVIA_REGEX = /(?:\s+|\/\*[\s\S]*?\*\/)+$/u;
const STATEMENT_START_REGEX = /[;{}]\s*$|^\s*$/u;
const TERMINATOR_NAMES = "andTee|andThen|mapErr|map|match|orElse|orTee|unwrapOr";
const TERMINATOR_REGEX = new RegExp(`^\\.(?:${TERMINATOR_NAMES})`, "u");
const TRIVIA_REGEX = /^(?:\s+|\/\/.*|\/\*[\s\S]*?\*\/)+/u;
const AFTER_LENGTH = 34;

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

    const after = tokens
      .slice(match.index + name.length)
      .filter(([, depth]) => depth === start[1])
      .map(([character]) => character)
      .join("")
      .replaceAll(/\s+/gu, " ")
      .trim()
      .slice(0, AFTER_LENGTH);
    if (TERMINATOR_REGEX.test(after)) continue;

    // Where no terminator follows the call, whatever the call's value reaches owns it instead — so the code
    // Before the call decides, and only one of its shapes is still this file's to answer. A binding is
    // Terminated wherever its name is read, which is the repo's preferred spelling over nesting a long call
    // Inside its own terminator, so the name is looked up. Everywhere else the value leaves the statement —
    // Handed to `return`, to a combinator's callback, to another call's argument list — and the caller
    // Terminates it. What is left is a call standing alone as a statement, which is the silent drop.
    const before = text.slice(0, start[2]).replace(PRECEDING_TRIVIA_REGEX, "").replace(PRECEDING_AWAIT_REGEX, "");
    const { binding } = BINDING_REGEX.exec(before)?.groups ?? {};
    if (binding) {
      if (new RegExp(`\\b${binding}\\??\\.(?:${TERMINATOR_NAMES})`, "u").test(code.slice(match.index))) continue;
    } else if (!STATEMENT_START_REGEX.test(before)) continue;

    results.push({ after, line: text.slice(0, start[2]).split("\n").length });
  }

  return results;
};
