import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { describe, expect, test } from "vitest";

describe(checkIsProcessRunning, () => {
  test("a process this user may not signal is running", () => {
    expect.hasAssertions();
    expect(checkIsProcessRunning(1)).toBe(true);
  });

  test("an id no process holds is not running", () => {
    expect.hasAssertions();
    expect(checkIsProcessRunning(2 ** 30)).toBe(false);
  });
});
