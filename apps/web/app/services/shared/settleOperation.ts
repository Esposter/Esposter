import type { MutationOutcome } from "@/models/shared/MutationOutcome";
import type { OperationContext } from "@/models/shared/OperationContext";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

export const settleOperation = async <TResult>(
  operate: (checkIsStale: () => boolean) => Promise<TResult>,
  { applyOptimistic, checkIsStale, isSilentWhenStale, onError, onSuccess }: OperationContext<TResult>,
): Promise<MutationOutcome<TResult>> => {
  const rollback = await applyOptimistic?.();
  return getResultAsync(() => operate(checkIsStale)).match<Promise<MutationOutcome<TResult>>>(
    async (result) => {
      // The target already holds a newer call's value, so applying this older one would undo it
      if (checkIsStale()) return { status: MutationStatus.Stale };

      await onSuccess?.(result);
      return { result, status: MutationStatus.Succeeded };
    },
    async (error) => {
      // A read that lost its race is silent — nothing was applied, so nothing is owed to the user
      if (isSilentWhenStale && checkIsStale()) return { status: MutationStatus.Stale };
      // A write always unwinds and reports, superseded or not: its rollback and its error are the only
      // Record that the value the user is looking at was never persisted
      rollback?.();
      if (onError) await onError(error);
      else createErrorAlert(error);
      return { error, status: MutationStatus.Failed };
    },
  );
};
