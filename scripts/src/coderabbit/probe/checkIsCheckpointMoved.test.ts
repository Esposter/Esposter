import { checkIsCheckpointMoved } from "#src/coderabbit/probe/checkIsCheckpointMoved";
import { describe, expect, test } from "vitest";

describe(checkIsCheckpointMoved, () => {
  test("reports a comment whose timestamp moved while its id did not", () => {
    expect.hasAssertions();

    expect(checkIsCheckpointMoved("7 2026-09-11T01:00:00Z", "7 2026-09-11T02:00:00Z")).toBe(true);
  });

  // A read that threw leaves an empty reading, which differs from the previous one and would otherwise end the
  // Wait as if the bot had answered
  test("reports nothing for a failed read", () => {
    expect.hasAssertions();

    expect(checkIsCheckpointMoved("7 2026-09-11T01:00:00Z", "")).toBe(false);
  });
});
