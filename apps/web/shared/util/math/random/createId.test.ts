import { EN_US_SEGMENTER } from "#shared/services/intl/constants";
import { ID_CHARACTERS } from "#shared/util/math/random/constants";
import { createId } from "#shared/util/math/random/createId";
import { describe, expect, test } from "vitest";

describe(createId, () => {
  test("generates id of correct length", () => {
    expect.hasAssertions();

    for (let length = 0; length < 10; length++) expect(createId(length)).toHaveLength(length);
  });

  test("contains only allowed characters", () => {
    expect.hasAssertions();

    const id = createId(100);

    expect([...EN_US_SEGMENTER.segment(id)].every(({ segment }) => ID_CHARACTERS.includes(segment))).toBe(true);
  });
});
