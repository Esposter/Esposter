import { EN_US_SEGMENTER } from "#shared/services/constants";
import { createId, ID_CHARACTERS } from "#shared/util/math/random/createId";
import { describe, expect, test } from "vitest";

describe(createId, () => {
  test("generates id of correct length", () => {
    expect.hasAssertions();

    for (let i = 0; i < 10; i++) expect(createId(i)).toHaveLength(i);
  });

  test("contains only allowed characters", () => {
    expect.hasAssertions();

    const id = createId(100);

    expect([...EN_US_SEGMENTER.segment(id)].every(({ segment }) => ID_CHARACTERS.includes(segment))).toBe(true);
  });
});
