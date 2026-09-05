import type { UnterminatedResult } from "#scripts/sweeps/unterminatedResults/models/UnterminatedResult";

import { scanCode } from "#scripts/sweeps/scanCode";

const CALL_REGEX = /getResult(?:Async)?\(/gu;
const TERMINATOR_REGEX = /^\.(?:andTee|andThen|mapErr|map|match|orElse|orTee|unwrapOr)/u;

// A `Result` nothing terminates fails silently, and no line-anchored grep can see it: the terminator sits after
// The call's closing bracket, which is wherever its callback ends — and a fixed window around the call reports
// Every site whose body runs long. So the scan matches the bracket instead. Everything inside the call is at a
// Deeper bracket depth, so the code at depth zero after it is exactly what follows the `)`; `scanCode` is what
// Makes that true, since a `)` inside a string or a comment closes nothing.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const results: UnterminatedResult[] = [];

  for (const match of text.matchAll(CALL_REGEX)) {
    const after = [...scanCode(text.slice(match.index + match[0].length - 1))]
      .filter(([, depth]) => depth === 0)
      .map(([character]) => character)
      .join("")
      .replaceAll(/\s+/gu, " ")
      .trim()
      .slice(0, 34);
    if (TERMINATOR_REGEX.test(after)) continue;
    results.push({ after, line: text.slice(0, match.index).split("\n").length });
  }

  return results;
};
