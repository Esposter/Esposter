import type { useMutation } from "#src/composables/shared/useMutation";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { describe, expect, expectTypeOf, test } from "vitest";

const mutate = () => Promise.resolve("");

describe("useMutation type", () => {
  type ExecuteMutation = ReturnType<typeof useMutation>["executeMutation"];

  // The background form is the last overload, which is the one `ReturnType` reads
  test("a background write gives its caller nothing to await", () => {
    expect.hasAssertions();

    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, { key: "" });
    expectTypeOf<ReturnType<ExecuteMutation>>().toEqualTypeOf<void>();
  });

  test("an awaited write names its reason", () => {
    expect.hasAssertions();

    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: "",
    });
  });
});
