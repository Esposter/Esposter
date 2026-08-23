import type { InvocationContext } from "@azure/functions";

import { db } from "#src/services/db";
import { getTableClient } from "#src/services/getTableClient";
import { executeAutomodAction, getMessageCreationRejection } from "@esposter/db";
import { AzureFunction, AzureTable, DatabaseEntityType, MessageCreationRejectionType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, WordFilteredError } from "@esposter/shared";

// The worker's face of the shared message-creation rules — the decision itself lives in `@esposter/db`, so a
// Scheduled delivery can never allow what the composer rejects, or reject what it allows. Only the word
// Filter is distinguishable here: the handler retries every other rejection, and must not retry that one.
export const assertCanCreateMessage = async (
  context: InvocationContext,
  userId: string,
  roomId: string,
  message: string,
): Promise<void> => {
  const rejection = await getMessageCreationRejection(db, userId, roomId, message);
  if (!rejection) return;

  const invalidOperationError = new InvalidOperationError(
    Operation.Create,
    DatabaseEntityType.ScheduledMessageJob,
    roomId,
  );
  if (rejection.type !== MessageCreationRejectionType.WordFilter) throw invalidOperationError;
  // A scheduled send that trips the filter carries the same consequence a live one does — the configured
  // Warn/Timeout is applied and audited here, since this is where the message is rejected.
  await executeAutomodAction(
    db,
    () => getTableClient(AzureTable.ModerationLog),
    {
      action: rejection.filter.action,
      roomId,
      timeoutDurationMs: rejection.filter.timeoutDurationMs,
      userId,
    },
    // Best-effort, but attributable: the timeout still applies, so a lost audit row is a moderator looking at a
    // Timed-out member with nothing explaining it — through the invocation's own sink, never bare console
    (error) => {
      context.error(`${AzureFunction.ProcessScheduledMessageJob} failed to write the automod audit row: `, error);
    },
  );
  throw new WordFilteredError(invalidOperationError.message);
};
