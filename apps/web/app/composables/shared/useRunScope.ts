import type { Promisable } from "type-fest";

import { getResultAsync, noop } from "@esposter/shared";

// The run scope of local work that has no version. A new run aborts the run before it, and only the newest run commits
// Its result. The task receives the signal for its own awaits and never checks it: a superseded run applies nothing, and
// Its result goes to `release` instead, so what the task built for it is let go, as a scope that is torn down does too.
// A commit that is still applying holds the scope's next commit until it settles, so two commits of one scope never overlap
export const useRunScope = () => {
  let current: AbortController | undefined;
  let applying: Promise<void> = Promise.resolve();
  onScopeDispose(() => {
    current?.abort();
  });
  const run = async <TResult>(
    task: (signal: AbortSignal) => Promise<TResult>,
    commit: (result: TResult) => Promisable<void>,
    release: (result: TResult) => void = noop,
  ): Promise<void> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    await getResultAsync(() => task(controller.signal)).match(
      async (result) => {
        const previous = applying;
        const { promise: settled, resolve: settle } = Promise.withResolvers<void>();
        applying = settled;
        await previous;
        try {
          if (controller.signal.aborted) release(result);
          else await commit(result);
        } finally {
          settle();
        }
      },
      (error) => {
        if (!controller.signal.aborted) throw error;
      },
    );
  };
  return { run };
};
