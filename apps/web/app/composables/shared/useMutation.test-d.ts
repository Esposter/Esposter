import type { useMutation } from "#src/composables/shared/useMutation";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { describe, expect, expectTypeOf, test } from "vitest";

const mutate = () => Promise.resolve("");

describe("useMutation type", () => {
  test("a background write names no reason and gives its caller nothing to await", () => {
    expect.hasAssertions();

    const reasoned = { awaitedBecause: AwaitedReason.ServerIssuedValue, key: "" };
    expectTypeOf<ReturnType<typeof useMutation>["executeBackgroundMutation"]>().toBeCallableWith(mutate, { key: "" });
    // @ts-expect-error A background write waits for nothing, so it cannot name a reason to wait
    expectTypeOf<ReturnType<typeof useMutation>["executeBackgroundMutation"]>().toBeCallableWith(mutate, reasoned);
    expectTypeOf<ReturnType<ReturnType<typeof useMutation>["executeBackgroundMutation"]>>().toEqualTypeOf<void>();
  });

  test("an awaited write names its reason and is refused without one", () => {
    expect.hasAssertions();

    const unreasoned = { key: "" };
    expectTypeOf<ReturnType<typeof useMutation>["executeMutation"]>().toBeCallableWith(mutate, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: "",
    });
    // @ts-expect-error An awaited write names the reason the screen waits for the server
    expectTypeOf<ReturnType<typeof useMutation>["executeMutation"]>().toBeCallableWith(mutate, unreasoned);
  });
});
