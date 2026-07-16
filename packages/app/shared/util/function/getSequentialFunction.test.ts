import { getSequentialFunction } from "#shared/util/function/getSequentialFunction";
import { describe, expect, test } from "vitest";

describe(getSequentialFunction, () => {
  test("runs calls strictly in order even when the first resolves slower", async () => {
    expect.hasAssertions();

    const firstCallGate: PromiseWithResolvers<void> = Promise.withResolvers();
    const order: number[] = [];
    const sequentialFn = getSequentialFunction(async (id: number, gate?: Promise<void>) => {
      if (gate) await gate;
      order.push(id);
    });

    const firstCall = sequentialFn(1, firstCallGate.promise);
    const secondCall = sequentialFn(2);

    firstCallGate.resolve();
    await Promise.all([firstCall, secondCall]);

    expect(order).toStrictEqual([1, 2]);
  });

  test("returns each call's own result", async () => {
    expect.hasAssertions();

    const sequentialFn = getSequentialFunction((value: string) => Promise.resolve(`${value}!`));

    const firstResult = await sequentialFn("a");
    const secondResult = await sequentialFn("b");

    expect(firstResult).toBe("a!");
    expect(secondResult).toBe("b!");
  });

  test("propagates a rejection to its own caller without blocking the next call", async () => {
    expect.hasAssertions();

    const sequentialFn = getSequentialFunction((shouldReject: boolean) =>
      shouldReject ? Promise.reject(new Error("boom")) : Promise.resolve("ok"),
    );

    const rejectingCall = sequentialFn(true);
    const nextCall = sequentialFn(false);

    await expect(rejectingCall).rejects.toThrow("boom");
    await expect(nextCall).resolves.toBe("ok");
  });
});
