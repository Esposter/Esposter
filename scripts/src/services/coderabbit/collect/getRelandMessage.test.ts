import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getRelandMessage } from "#src/services/coderabbit/collect/getRelandMessage";
import { describe, expect, test } from "vitest";

describe(getRelandMessage, () => {
  // A copy naming a sha the held branch carries is owed nowhere, and a claim would send it back to the lane
  test("drops every ported line and the claim", () => {
    expect.hasAssertions();

    expect(getRelandMessage(`a\n\n${EXPRESS_TRAILER}: a\n(cherry picked from commit ${"a".repeat(40)})\n`)).toBe("a");
  });
});
