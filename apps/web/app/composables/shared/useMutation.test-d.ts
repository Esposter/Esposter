import type { useMutation } from "#src/composables/shared/useMutation";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { noop } from "@esposter/shared";
import { describe, expect, expectTypeOf, test } from "vitest";

const mutate = () => Promise.resolve("");

describe("useMutation type", () => {
  type ExecuteMutation = ReturnType<typeof useMutation>["executeMutation"];

  // The optimistic form is the last overload, which is the one `ReturnType` reads
  test("an optimistic write gives its caller nothing to await", () => {
    expect.hasAssertions();

    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, { applyOptimistic: () => noop, key: "" });
    expectTypeOf<ReturnType<ExecuteMutation>>().toEqualTypeOf<void>();
  });

  test("an awaited write names its reason", () => {
    expect.hasAssertions();

    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: "",
    });
  });

  test("options naming neither form are refused", () => {
    expect.hasAssertions();

    // @ts-expect-error A write names how it shows: an optimistic apply or a reason to wait
    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, { key: "" });
  });
});
