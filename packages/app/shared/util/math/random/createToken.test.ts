import { EN_US_SEGMENTER } from "#shared/services/constants";
import { createToken, TOKEN_CHARACTERS } from "#shared/util/math/random/createToken";
import { describe, expect, test } from "vitest";

describe(createToken, () => {
  test("generates token of correct length", () => {
    expect.hasAssertions();

    for (let i = 0; i < 10; i++) expect(createToken(i)).toHaveLength(i);
  });

  test("contains only allowed characters", () => {
    expect.hasAssertions();

    const token = createToken(100);

    expect([...EN_US_SEGMENTER.segment(token)].every(({ segment }) => TOKEN_CHARACTERS.includes(segment))).toBe(true);
  });
});
