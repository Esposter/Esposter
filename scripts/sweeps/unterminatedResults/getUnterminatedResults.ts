import type { UnterminatedResult } from "#scripts/sweeps/unterminatedResults/models/UnterminatedResult";

import { scanCode } from "#scripts/sweeps/scanCode";

const ASYNC_NAME = "getResultAsync";
const CALL_REGEX = /getResult/gu;
const NAME = "getResult";
const TERMINATOR_REGEX = /^\.(?:andTee|andThen|mapErr|map|match|orElse|orTee|unwrapOr)/u;
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
// Identifier, and only the source says whether a `(` opens right after the name.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const tokens = [...scanCode(text)];
  const code = tokens.map(([character]) => character).join("");
  const results: UnterminatedResult[] = [];

  for (const match of code.matchAll(CALL_REGEX)) {
    const start = tokens[match.index];
    if (!start) continue;

    const name = text.startsWith(ASYNC_NAME, start[2]) ? ASYNC_NAME : NAME;
    if (text[start[2] + name.length] !== "(") continue;

    const after = tokens
      .slice(match.index + name.length)
      .filter(([, depth]) => depth === start[1])
      .map(([character]) => character)
      .join("")
      .replaceAll(/\s+/gu, " ")
      .trim()
      .slice(0, AFTER_LENGTH);
    if (TERMINATOR_REGEX.test(after)) continue;
    results.push({ after, line: text.slice(0, start[2]).split("\n").length });
  }

  return results;
};
