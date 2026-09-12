import type { Promisable } from "type-fest";

export interface OperationContext<TResult> {
  applyOptimistic?: () => Promisable<() => void>;
  checkIsStale: () => boolean;
  isSilentWhenStale: boolean;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}
