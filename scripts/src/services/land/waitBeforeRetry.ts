import { checkIsRetryablePush } from "#src/services/land/checkIsRetryablePush";
import { PUSH_RETRY_MILLISECONDS } from "#src/services/land/constants";
import { readRejectionLine } from "#src/services/land/readRejectionLine";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { setTimeout as sleep } from "node:timers/promises";

// Waits out a failed push or pull that another session's push could have caused, and throws the failure itself when it
// Is one a retry cannot change, or when the last attempt was the one that failed
export const waitBeforeRetry = async (stderr: string, attempt: number, maxAttempts: number): Promise<void> => {
  if (!checkIsRetryablePush(stderr) || attempt >= maxAttempts)
    throw new InvalidOperationError(Operation.Update, QUEUE_BRANCH, readRejectionLine(stderr));
  // oxlint-disable-next-line no-await-in-loop -- the landing loop is the only caller, and each attempt waits for the one before it
  await sleep(PUSH_RETRY_MILLISECONDS);
};
