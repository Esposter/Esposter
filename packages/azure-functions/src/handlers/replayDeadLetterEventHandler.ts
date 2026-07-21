import type { EventGridHandler } from "@azure/functions";

import { deadLetteredEventSchema } from "@/models/DeadLetteredEvent";
import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "@/services/constants";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { formatReplayId } from "@/services/formatReplayId";
import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
import { parseReplayId } from "@/services/parseReplayId";
import { writeDeadLetterBlob } from "@/services/writeDeadLetterBlob";
import {
  AzureContainer,
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import { getResult, getResultAsync, noop } from "@esposter/shared";
import { z } from "zod";

export const replayDeadLetterEventHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ReplayDeadLetterEvent} processed blob: `, event.subject);
  return getResultAsync(async () => {
    // The subscription already filters on this prefix; the guard stops a hand-fired or mis-scoped event
    // From driving container operations against a blob outside the dead-letter container.
    if (!event.subject.startsWith(DEAD_LETTER_BLOB_SUBJECT_PREFIX)) return;

    const blobName = event.subject.slice(DEAD_LETTER_BLOB_SUBJECT_PREFIX.length);
    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const content = await blockBlobClient.downloadToBuffer();
    const events = getResult(() => z.array(deadLetteredEventSchema).parse(JSON.parse(content.toString("utf8"))))
      .orTee((error) => {
        context.error(
          `${AzureFunction.ReplayDeadLetterEvent} quarantined ${blobName}, malformed dead-letter payload: `,
          error,
        );
      })
      .unwrapOr(undefined);
    // A blob that is not a dead-letter event array can never become publishable, so it is quarantined
    // Rather than republished — republishing a broken payload would just dead-letter it again.
    if (!events) {
      await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content);
      await blockBlobClient.delete();
      return;
    }
    // Capped per event, not per blob: Event Grid batches whatever expired together, so one poison payload must not
    // Strand the transient failures sharing its blob, and a blob-level count would be meaningless anyway once the
    // Batch splits across cycles.
    const replays = events.map((deadLetteredEvent) => ({ ...parseReplayId(deadLetteredEvent.id), deadLetteredEvent }));
    const quarantinedReplays = replays.filter(
      ({ replayAttempts }) => replayAttempts >= MAX_DEAD_LETTER_REPLAY_ATTEMPTS,
    );
    const replayableReplays = replays.filter(({ replayAttempts }) => replayAttempts < MAX_DEAD_LETTER_REPLAY_ATTEMPTS);
    if (quarantinedReplays.length > 0) {
      await writeDeadLetterBlob(
        containerClient,
        blobName,
        DEAD_LETTER_QUARANTINE_PREFIX,
        Buffer.from(JSON.stringify(quarantinedReplays.map(({ deadLetteredEvent }) => deadLetteredEvent))),
      );
      context.error(
        `${AzureFunction.ReplayDeadLetterEvent} quarantined ${quarantinedReplays.length} of ${replays.length} events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times`,
      );
    }
    // Nothing left to resend: the quarantine copy is the record of what arrived, so the original is simply dropped.
    if (replayableReplays.length === 0) {
      await blockBlobClient.delete();
      return;
    }
    // Each republish carries the incremented count on its id, which Event Grid writes back verbatim if this delivery
    // Dead-letters again — that is what makes the cap hold across cycles instead of restarting on every new blob.
    // Delivery is at-least-once: a send that throws mid-batch is retried whole by the redelivered blob event, so a
    // Handler that already ran can run twice. Handlers are idempotent for exactly this reason.
    await eventGridPublisherClient.send(
      replayableReplays.map(
        ({ deadLetteredEvent: { data, dataVersion, eventType, subject }, eventId, replayAttempts }) => ({
          data,
          dataVersion,
          eventType,
          id: formatReplayId({ eventId, replayAttempts: replayAttempts + 1 }),
          subject,
        }),
      ),
    );
    // Best-effort like every post-persist step: the events are already republished, so a failed archive must not
    // Rethrow and redeliver them. An un-deleted original merely lingers until the container's lifecycle rule sweeps
    // It — it cannot retrigger a replay, since only a BlobCreated event does that.
    await getResultAsync(async () => {
      await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_ARCHIVED_PREFIX, content);
      await blockBlobClient.delete();
    }).match(noop, (error) => {
      context.error(`${AzureFunction.ReplayDeadLetterEvent} failed to archive ${blobName}: `, error);
    });
  }).match(noop, logAndRethrow(context, AzureFunction.ReplayDeadLetterEvent));
};
