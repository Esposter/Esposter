import { getWordErrorRate } from "#src/services/voiceMatch/bank/getWordErrorRate";
import { describe, expect, test } from "vitest";

describe(getWordErrorRate, () => {
  test("hears the sentence back through its case and punctuation", () => {
    expect.hasAssertions();

    expect(getWordErrorRate("A b.", "a, B")).toBe(0);
  });

  test("counts a substitution, an insertion and a deletion over the words said", () => {
    expect.hasAssertions();

    expect(getWordErrorRate("a b c d", "a x c d")).toBe(0.25);
    expect(getWordErrorRate("a b c d", "a b x c d")).toBe(0.25);
    expect(getWordErrorRate("a b c d", "a c d")).toBe(0.25);
  });

  test("hears nothing as every word lost", () => {
    expect.hasAssertions();

    expect(getWordErrorRate("a b", "")).toBe(1);
  });
});
