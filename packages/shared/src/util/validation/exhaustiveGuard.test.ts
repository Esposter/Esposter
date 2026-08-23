import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { exhaustiveGuard } from "#src/util/validation/exhaustiveGuard";
import { describe, expect, test } from "vitest";

describe(exhaustiveGuard, () => {
  test("throws", () => {
    expect.hasAssertions();

    const value = "" as never;

    expect(() => exhaustiveGuard(value)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value)).message}]`,
    );
  });
});
