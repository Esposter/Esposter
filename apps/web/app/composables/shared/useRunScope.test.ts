import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
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

  test("a new run aborts the signal of the run before it", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const { promise: pending, resolve } = Promise.withResolvers<string>();
    let firstSignal: AbortSignal | undefined;
    const firstRun = runScope.run((signal) => {
      firstSignal = signal;
      return pending;
    }, vi.fn<(value: string) => void>());
    const secondRun = runScope.run(() => pending, vi.fn<(value: string) => void>());

    expect(firstSignal?.aborted).toBe(true);

    resolve(result);
    await Promise.all([firstRun, secondRun]);
  });

  test("disposing the scope aborts its live run and commits nothing", async () => {
    expect.hasAssertions();

    const scope = effectScope();
    const runScope = scope.run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const release = vi.fn<(value: string) => void>();
    const { promise: pending, resolve } = Promise.withResolvers<string>();
    const run = runScope.run(() => pending, commit, release);
    scope.stop();
    resolve(result);
    await run;

    expect(commit).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledExactlyOnceWith(result);
  });

  // What an aborted run built is released by the scope, since the run that built it never commits
  test("an aborted run's result goes to release rather than commit", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const release = vi.fn<(value: string) => void>();
    const first = Promise.withResolvers<string>();
    const firstRun = runScope.run(() => first.promise, commit, release);
    const secondRun = runScope.run(() => Promise.resolve(newerResult), commit, release);
    first.resolve(result);
    await Promise.all([firstRun, secondRun]);

    expect(release).toHaveBeenCalledExactlyOnceWith(result);
    expect(commit).toHaveBeenCalledExactlyOnceWith(newerResult);
  });

  // A commit still applying holds the scope's next commit until it settles, so two picks' applies never overlap
  test("a commit still applying holds the next commit of its scope until it settles", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const firstApply = Promise.withResolvers<void>();
    const firstCommit = vi.fn<(value: string) => Promise<void>>().mockReturnValueOnce(firstApply.promise);
    const secondCommit = vi.fn<(value: string) => void>();
    const firstRun = runScope.run(() => Promise.resolve(result), firstCommit);
    await flushPromises();
    const secondRun = runScope.run(() => Promise.resolve(newerResult), secondCommit);
    await flushPromises();

    expect(secondCommit).not.toHaveBeenCalled();

    firstApply.resolve();
    await Promise.all([firstRun, secondRun]);

    expect(secondCommit).toHaveBeenCalledExactlyOnceWith(newerResult);
  });

  // A key is a run of its own: a run of another key neither aborts the one in flight nor is aborted by it
  test("a run of one key does not abort the run of another key", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const firstRunKey = Symbol("first");
    const otherRunKey = Symbol("other");
    const first = Promise.withResolvers<string>();
    const firstRun = runScope.run(() => first.promise, commit, noop, firstRunKey);
    const otherRun = runScope.run(() => Promise.resolve(newerResult), commit, noop, otherRunKey);
    first.resolve(result);
    await Promise.all([firstRun, otherRun]);

    expect(commit).toHaveBeenCalledTimes(2);
  });

  test("a new run of a key aborts the run of that key before it", async () => {
    expect.hasAssertions();

    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);
    const commit = vi.fn<(value: string) => void>();
    const runKey = Symbol("run");
    const first = Promise.withResolvers<string>();
    const firstRun = runScope.run(() => first.promise, commit, noop, runKey);
    const secondRun = runScope.run(() => Promise.resolve(newerResult), commit, noop, runKey);
    first.resolve(result);
    await Promise.all([firstRun, secondRun]);

    expect(commit).toHaveBeenCalledExactlyOnceWith(newerResult);
  });
});
