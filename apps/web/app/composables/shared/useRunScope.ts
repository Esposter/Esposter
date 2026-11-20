import { getResultAsync, noop } from "@esposter/shared";

// The run scope of local work that has no version. A new run aborts the run before it, and only the newest run commits
// Its result. The task receives the signal for its own awaits and never checks it: a superseded run applies nothing, and
// Its result goes to `release` instead, so what the task built for it is let go, as a scope that is torn down does too
export const useRunScope = () => {
  let current: AbortController | undefined;
  onScopeDispose(() => {
    current?.abort();
  });
  const run = <TResult>(
    task: (signal: AbortSignal) => Promise<TResult>,
    commit: (result: TResult) => void,
    release: (result: TResult) => void = noop,
  ): Promise<void> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    return getResultAsync(() => task(controller.signal)).match(
      (result) => {
        if (controller.signal.aborted) release(result);
        else commit(result);
      },
      (error) => {
        if (!controller.signal.aborted) throw error;
      },
    );
  };
  return { run };
};
