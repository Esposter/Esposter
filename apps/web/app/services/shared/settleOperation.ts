import type { MutationOutcome } from "#src/models/shared/MutationOutcome";
import type { OperationContext } from "#src/models/shared/OperationContext";

import { MutationStatus } from "#src/models/shared/MutationStatus";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

export const settleOperation = <TResult>(
  operate: () => Promise<TResult>,
  { onError, onSuccess }: OperationContext<TResult>,
) =>
  getResultAsync(operate).match<Promise<MutationOutcome<TResult>>>(
    async (result) => {
      await onSuccess?.(result);
      return { result, status: MutationStatus.Succeeded };
    },
    async (error) => {
      // A failed write always reports its error, the only record that the change it asked for was never persisted
      if (onError) await onError(error);
      else createErrorAlert(error);
      return { error, status: MutationStatus.Failed };
    },
  );
