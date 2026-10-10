import { formatThousands } from "#src/services/usage/formatThousands";
import { describe, expect, test } from "vitest";

describe(formatThousands, () => {
  test.each([
    [0, "0K"],
    [228_400, "228K"],
  ])("%s tokens read as %s", (tokens, formatted) => {
    expect.hasAssertions();

    expect(formatThousands(tokens)).toBe(formatted);
  });
});
