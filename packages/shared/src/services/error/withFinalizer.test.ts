import { withFinalizer } from "#src/services/error/withFinalizer";
import { noop } from "#src/util/function/noop";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(withFinalizer, () => {
  const callbackError = new Error("callback");
  const finalizerError = new Error("finalizer");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("throws the callback's error and logs the finalizer's when both fail", () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);

    expect(() =>
      withFinalizer(
        () => {
          throw callbackError;
        },
        () => {
          throw finalizerError;
        },
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: callback]`);
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(finalizerError);
  });

  test("throws the finalizer's error when only it fails", () => {
    expect.hasAssertions();

    expect(() => {
      withFinalizer(noop, () => {
        throw finalizerError;
      });
    }).toThrowErrorMatchingInlineSnapshot(`[Error: finalizer]`);
  });
});
