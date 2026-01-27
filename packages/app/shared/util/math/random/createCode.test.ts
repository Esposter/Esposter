import { CHARACTERS, createCode } from "#shared/util/math/random/createCode";
import { describe, expect, test } from "vitest";

describe(createCode, () => {
  test("generates code of correct length", () => {
    expect.hasAssertions();

    for (let i = 0; i < 10; i++) expect(createCode(i)).toHaveLength(i);
  });

  test("contains only allowed characters", () => {
    expect.hasAssertions();

    const code = createCode(100);

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    expect([...code].every((char) => CHARACTERS.includes(char))).toBe(true);
  });
});
