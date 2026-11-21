import type { MutationOutcome } from "#src/models/shared/MutationOutcome";
import type { OperationContext } from "#src/models/shared/OperationContext";

import { MutationStatus } from "#src/models/shared/MutationStatus";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

export const settleOperation = async <TResult>(
  operate: () => Promise<TResult>,
  { applyOptimistic, onError, onSuccess }: OperationContext<TResult>,
) => {
  const rollback = await applyOptimistic?.();
  return getResultAsync(operate).match<Promise<MutationOutcome<TResult>>>(
    async (result) => {
      await onSuccess?.(result);
      return { result, status: MutationStatus.Succeeded };
    },
    async (error) => {
      // A write always unwinds and reports: its rollback and its error are the only record that the value the user is
      // Looking at was never persisted
      rollback?.();
      if (onError) await onError(error);
      else createErrorAlert(error);
      return { error, status: MutationStatus.Failed };
    },
  );
};
