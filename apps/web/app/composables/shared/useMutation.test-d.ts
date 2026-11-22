import type { useMutation } from "#src/composables/shared/useMutation";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { noop } from "@esposter/shared";
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

  test("a write takes no rollback in either form", () => {
    expect.hasAssertions();

    // @ts-expect-error A failed write is reported, and nothing on screen is put back, so a rollback is not a member
    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, { applyOptimistic: noop, key: "" });
    // @ts-expect-error A failed awaited write is reported, and nothing on screen is put back, so a rollback is not a member
    expectTypeOf<ExecuteMutation>().toBeCallableWith(mutate, {
      applyOptimistic: noop,
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: "",
    });
  });
});
