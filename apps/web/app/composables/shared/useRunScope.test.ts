import { assert, describe, expect, test, vi } from "vitest";

describe(useRunScope, () => {
  const result = "";
  const newerResult = " ";

  test("a new run aborts the run before it, and only the newest run's result is committed", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const first = Promise.withResolvers<string>();
    const second = Promise.withResolvers<string>();
    const firstRun = runScope.run(() => first.promise, commit);
    const secondRun = runScope.run(() => second.promise, commit);
    second.resolve(newerResult);
    await secondRun;
    first.resolve(result);
    await firstRun;

    expect(commit).toHaveBeenCalledExactlyOnceWith(newerResult);
  });

  test("a new run aborts the signal of the run before it", () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    let firstSignal: AbortSignal | undefined;
    runScope.run((signal) => {
      firstSignal = signal;
      return new Promise<string>(() => {});
    }, vi.fn<(value: string) => void>());
    runScope.run(() => new Promise<string>(() => {}), vi.fn<(value: string) => void>());

    expect(firstSignal?.aborted).toBe(true);
  });

  test("disposing the scope aborts its live run and commits nothing", async () => {
    expect.hasAssertions();

    const scope = effectScope();
    const runScope = scope.run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const { promise: pending, resolve } = Promise.withResolvers<string>();
    const run = runScope.run(() => pending, commit);
    scope.stop();
    resolve(result);
    await run;

    expect(commit).not.toHaveBeenCalled();
  });
});
