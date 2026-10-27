import { readSpecFindings } from "#src/services/openspec/readSpecFindings";
import { describe, expect, test } from "vitest";

describe(readSpecFindings, () => {
  test("every OpenSpec spec in the repository reads as GIVEN? WHEN THEN scenarios and cites no source in a requirement body", () => {
    expect.hasAssertions();

    expect(readSpecFindings()).toStrictEqual([]);
  });
});
