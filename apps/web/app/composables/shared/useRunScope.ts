import { getResultAsync } from "@esposter/shared";

// The run scope of local work that has no version. A new run aborts the run before it, and only the newest run commits
// Its result. The task receives the signal for its own awaits and never checks it: a superseded run resolves with
// Nothing applied, and a scope that is torn down aborts its live run the same way
export const useRunScope = () => {
  let current: AbortController | undefined;
  onScopeDispose(() => {
    current?.abort();
  });
  const run = <TResult>(
    task: (signal: AbortSignal) => Promise<TResult>,
    commit: (result: TResult) => void,
  ): Promise<void> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    return getResultAsync(() => task(controller.signal)).match(
      (result) => {
        if (!controller.signal.aborted) commit(result);
      },
      (error) => {
        if (!controller.signal.aborted) throw error;
      },
    );
  };
  return { run };
};
