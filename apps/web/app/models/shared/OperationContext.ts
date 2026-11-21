import type { Promisable } from "type-fest";

export interface OperationContext<TResult> {
  applyOptimistic?: (() => Promisable<() => void>) | undefined;
  onError?: ((error: Error) => Promisable<void>) | undefined;
  onSuccess?: ((result: TResult) => Promisable<void>) | undefined;
}
