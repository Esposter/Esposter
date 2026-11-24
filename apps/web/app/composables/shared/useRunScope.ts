import type { Promisable } from "type-fest";

import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

// The run scope of local work that has no version. A new run aborts the run before it of its own key, and only the
// Newest run of a key commits its result. A run that names no key is one run of the scope. The task receives the signal
// For its own awaits and never checks it: a superseded run applies nothing, and its result goes to `release` instead,
// So what the task built for it is let go, as a scope that is torn down does too. A commit that is still applying holds
// The scope's next commit until it settles, so two commits of one scope never overlap
export const useRunScope = () => {
  // The run each key is on. A run leaves the map once it settles, so the map holds only the keys with a run in flight
  const currentRunMap = new Map<PropertyKey | undefined, AbortController>();
  let applying: Promise<void> = Promise.resolve();
  onScopeDispose(() => {
    for (const controller of currentRunMap.values()) controller.abort();
    currentRunMap.clear();
  });
  const run = async <TResult>(
    task: (signal: AbortSignal) => Promise<TResult>,
    commit: (result: TResult) => Promisable<void>,
    release: (result: TResult) => void = noop,
    key?: PropertyKey,
  ): Promise<void> => {
    currentRunMap.get(key)?.abort();
    const controller = new AbortController();
    currentRunMap.set(key, controller);
    await withFinalizerAsync(
      () =>
        getResultAsync(() => task(controller.signal)).match(
          async (result) => {
            const previous = applying;
            const { promise: settled, resolve: settle } = Promise.withResolvers<void>();
            applying = settled;
            await previous;
            await withFinalizerAsync(async () => {
              if (controller.signal.aborted) release(result);
              else await commit(result);
            }, settle);
          },
          (error) => {
            if (!controller.signal.aborted) throw error;
          },
        ),
      () => {
        if (currentRunMap.get(key) === controller) currentRunMap.delete(key);
      },
    );
  };
  return { run };
};
