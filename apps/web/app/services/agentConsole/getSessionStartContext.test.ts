import { getSessionStartContext } from "@/services/agentConsole/getSessionStartContext";
import { describe, expect, test } from "vitest";

describe(getSessionStartContext, () => {
  const additionalContext = "additionalContext";

  test("reads the context from the hook's JSON form", () => {
    expect.hasAssertions();

    expect(getSessionStartContext(JSON.stringify({ hookSpecificOutput: { additionalContext } }))).toBe(
      additionalContext,
    );
  });

  test.each(["", additionalContext, "{}"])("reads none from %j", (stdout) => {
    expect.hasAssertions();

    expect(getSessionStartContext(stdout)).toBe("");
  });
});
