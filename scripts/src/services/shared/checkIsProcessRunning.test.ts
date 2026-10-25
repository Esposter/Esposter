import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(checkIsProcessRunning, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("the running process is running", () => {
    expect.hasAssertions();
    expect(checkIsProcessRunning(process.pid)).toBe(true);
  });

  test("a process this user may not signal is running", () => {
    expect.hasAssertions();

    vi.spyOn(process, "kill").mockImplementation(() => {
      throw Object.assign(new Error("EPERM"), { code: "EPERM" });
    });

    expect(checkIsProcessRunning(1)).toBe(true);
  });

  test("an id no process holds is not running", () => {
    expect.hasAssertions();
    expect(checkIsProcessRunning(2 ** 30)).toBe(false);
  });
});
