import { checkIsMemoryGateOpen } from "#src/services/worktree/create/checkIsMemoryGateOpen";
import { describe, expect, test } from "vitest";

describe(checkIsMemoryGateOpen, () => {
  test("opens once free memory reaches the gate's share of the machine's RAM", () => {
    expect.hasAssertions();

    expect(checkIsMemoryGateOpen(4, 32)).toBe(true);
    expect(checkIsMemoryGateOpen(3.9, 32)).toBe(false);
  });
});
