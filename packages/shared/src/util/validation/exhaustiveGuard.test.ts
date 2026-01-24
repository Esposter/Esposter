import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import { exhaustiveGuard } from "@/util/validation/exhaustiveGuard";
import { describe, expect, test } from "vitest";

describe(exhaustiveGuard, () => {
  test("throws", () => {
    expect.hasAssertions();

    const value = "" as never;

    expect(() => exhaustiveGuard(value)).toThrowError(
      new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value)),
    );
  });
});
