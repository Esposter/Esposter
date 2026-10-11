import { parseString } from "#src/parseString";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe("parseString", () => {
  // Issues #47, #48, #159 and #379: the callback is called before parseString returns unless `async` is set
  test("calls the callback before returning by default", () => {
    expect.hasAssertions();

    const callback = vi.fn<(error: Error | null, result: unknown) => void>();
    parseString("<a>a</a>", callback);

    expect(callback).toHaveBeenCalledExactlyOnceWith(null, { a: "a" });
  });

  // Issue #76: parsing that blocks the event loop is opt-in, so an async callback runs on a later turn
  test("calls the callback on a later turn when async is set", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<void>();
    const callback = vi.fn<(error: Error | null, result: unknown) => void>(() => resolve());
    parseString("<a>a</a>", { async: true }, callback);

    expect(callback).not.toHaveBeenCalled();
    await promise;
    expect(callback).toHaveBeenCalledExactlyOnceWith(null, { a: "a" });
  });

  test("passes the parse error to the callback with no result", () => {
    expect.hasAssertions();

    const callback = vi.fn<(error: Error | null, result: unknown) => void>();
    parseString("<a></b>", callback);

    const [error, result] = takeOne(callback.mock.calls);
    expect(error).toStrictEqual(new Error("Unexpected close tag\nLine: 0\nColumn: 7\nChar: >"));
    expect(result).toBeNull();
  });
});
