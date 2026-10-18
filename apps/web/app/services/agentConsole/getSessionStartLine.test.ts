import { getSessionStartLine } from "@/services/agentConsole/getSessionStartLine";
import { describe, expect, test } from "vitest";

describe(getSessionStartLine, () => {
  const prefix = "Prefix: ";
  const value = "value";

  test("reads the rest of the first line that starts with the prefix", () => {
    expect.hasAssertions();

    expect(getSessionStartLine(`other\n${prefix}${value}\n${prefix}second`, prefix)).toBe(value);
  });

  test("reads nothing when no line starts with the prefix", () => {
    expect.hasAssertions();

    expect(getSessionStartLine(`${value}\nnot ${prefix}${value}`, prefix)).toBe("");
  });
});
