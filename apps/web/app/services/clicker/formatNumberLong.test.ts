import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { describe, expect, test } from "vitest";

describe(formatNumberLong, () => {
  test("leaves a number under a thousand as it is", () => {
    expect.hasAssertions();

    expect(formatNumberLong(999)).toBe("999");
  });

  test("shortens a number to the largest unit it reaches", () => {
    expect.hasAssertions();

    expect(formatNumberLong(1500)).toBe("1.5 thousand");
    expect(formatNumberLong(2e6)).toBe("2 million");
  });

  // The rounding is to three decimal places of the shortened figure, not of the whole number
  test("rounds the shortened figure to three decimal places", () => {
    expect.hasAssertions();

    expect(formatNumberLong(1234.5678)).toBe("1.235 thousand");
  });

  test("fixes the shortened figure to the digits asked for", () => {
    expect.hasAssertions();

    expect(formatNumberLong(1500, 2)).toBe("1.50 thousand");
  });

  // Past the longest unit there is no name left to give a number, so it reads as infinite
  test("reads a number with no unit left to name as Infinity", () => {
    expect.hasAssertions();

    expect(formatNumberLong(Infinity)).toBe("Infinity");
    expect(formatNumberLong(1e303)).toBe("Infinity");
  });
});
