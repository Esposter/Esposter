import { splitSentences } from "#src/services/splitSentences";
import { describe, expect, test } from "vitest";

describe(splitSentences, () => {
  test.each([
    ["one sentence per terminator", "a. b! c?", ["a.", "b!", "c?"]],
    ["a tail the reply never terminated", "a. b", ["a.", "b"]],
    ["a terminator inside a number", "3.5 a.", ["3.5 a."]],
    ["a sentence with no Latin letter among readable ones", "a. あ。", ["a."]],
    ["a sentence in another script with one Latin word in it", "a. PowerShellで動く。", ["a."]],
    ["nothing", "", []],
  ])("%s: cuts into %s", (_case, prose, expected) => {
    expect.hasAssertions();

    expect(splitSentences(prose)).toStrictEqual(expected);
  });
});
