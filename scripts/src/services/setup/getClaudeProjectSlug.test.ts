import { getClaudeProjectSlug } from "#src/services/setup/getClaudeProjectSlug";
import { describe, expect, test } from "vitest";

describe(getClaudeProjectSlug, () => {
  test("turns each slash and dot of a path into a dash, so a hidden folder keeps its own dash", () => {
    expect.hasAssertions();

    expect(getClaudeProjectSlug("/Users/ada/Work/.agents/checkout")).toBe("-Users-ada-Work--agents-checkout");
  });
});
