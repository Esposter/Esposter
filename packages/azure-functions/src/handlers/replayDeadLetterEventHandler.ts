import type { EventGridHandler } from "@azure/functions";

import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "@/services/constants";
import { deleteReplayedBlob } from "@/services/deleteReplayedBlob";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { formatReplayId } from "@/services/formatReplayId";
import { getContainerClient } from "@/services/getContainerClient";
import { getIsReplayable } from "@/services/getIsReplayable";
import { logAndRethrow } from "@/services/logAndRethrow";
import { parseReplayId } from "@/services/parseReplayId";
import { writeDeadLetterBlob } from "@/services/writeDeadLetterBlob";
import {
  AzureContainer,
  AzureFunction,
  createEventGridEventSchema,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
  DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX,
} from "@esposter/db-schema";
import { getResult, getResultAsync, noop } from "@esposter/shared";
import { z } from "zod";

// The replay is payload-agnostic — it resends whatever it finds, and only each event's handler knows how to read its
// `data` — so the envelope is parsed with the shared factory over an opaque payload. Duplicate ids are valid, not
// Malformed: delivery is at-least-once and a send retried whole after a partial failure puts two copies of one id on
// The topic, so rejecting the array would quarantine every replayable event batched alongside them.
const deadLetteredEventsSchema = createEventGridEventSchema(z.unknown()).array();

export const replayDeadLetterEventHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ReplayDeadLetterEvent} processed blob: `, event.subject);
  return getResultAsync(async () => {
    // The subscription already filters on this prefix; the guard stops a hand-fired or mis-scoped event
    // From driving container operations against a blob outside the dead-letter container.
    if (!event.subject.startsWith(DEAD_LETTER_BLOB_SUBJECT_PREFIX)) return;

    const blobName = event.subject.slice(DEAD_LETTER_BLOB_SUBJECT_PREFIX.length);
    // The subscription's advanced filter already excludes both prefixes; repeated here so a hand-fired or mis-scoped
    // Event cannot make the replay consume — and delete — the archived or quarantined copies it wrote itself.
    if (blobName.startsWith(DEAD_LETTER_ARCHIVED_PREFIX) || blobName.startsWith(DEAD_LETTER_QUARANTINE_PREFIX)) return;

    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // Delivery is at-least-once, and every terminal path here deletes the blob it just handled, so a redelivered
    // Event finds nothing left to replay. That is a completed replay, not a failure: downloading it anyway would 404
    // Into logAndRethrow and spend all ten delivery attempts logging errors for work that already succeeded.
    if (!(await blockBlobClient.exists())) return;
    const content = await blockBlobClient.downloadToBuffer();
    const events = getResult(() => deadLetteredEventsSchema.parse(JSON.parse(content.toString("utf8"))))
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
      await deleteReplayedBlob(context, blockBlobClient, blobName);
      return;
    }
    // Judged per event, not per blob: Event Grid batches whatever expired together, so one poison payload must not
    // Strand the transient failures sharing its blob, and a blob-level count would be meaningless anyway once the
    // Batch splits across cycles. GetIsReplayable owns both bars — the replay cap and handler idempotency.
    const replays = events.map((deadLetteredEvent) => {
      const { eventId, replayAttempts } = parseReplayId(deadLetteredEvent.id);
      return { deadLetteredEvent, eventId, replayAttempts };
    });
    const quarantinedReplays = replays.filter(
      ({ deadLetteredEvent, replayAttempts }) => !getIsReplayable(deadLetteredEvent.eventType, replayAttempts),
    );
    const replayableReplays = replays.filter(({ deadLetteredEvent, replayAttempts }) =>
      getIsReplayable(deadLetteredEvent.eventType, replayAttempts),
    );
    if (quarantinedReplays.length > 0) {
      const isQuarantineCreated = await writeDeadLetterBlob(
        containerClient,
        blobName,
        DEAD_LETTER_QUARANTINE_PREFIX,
        Buffer.from(JSON.stringify(quarantinedReplays.map(({ deadLetteredEvent }) => deadLetteredEvent))),
      );
      // Quarantining stays ahead of the republish so a poison payload never rides along in the resend batch, which
      // Means a send that throws below reruns this whole step on the redelivered blob. Rewriting the quarantine copy
      // Is harmless — same path, same bytes — but this line is the alert an operator is paged on, so it is tied to the
      // Delivery that created the copy: a redelivery of an already-quarantined payload is not a new incident.
      if (isQuarantineCreated)
        context.error(
          `${AzureFunction.ReplayDeadLetterEvent} quarantined ${quarantinedReplays.length} of ${replays.length} events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times or raised by a handler a replay cannot safely rerun`,
        );
    }
    // Nothing left to resend: the quarantine copy is the record of what arrived, so the original is simply dropped.
    if (replayableReplays.length === 0) {
      await deleteReplayedBlob(context, blockBlobClient, blobName);
      return;
    }
    // Each republish carries the incremented count on its id, which Event Grid writes back verbatim if this delivery
    // Dead-letters again — that is what makes the cap hold across cycles instead of restarting on every new blob.
    // Delivery is at-least-once: a send that throws mid-batch is retried whole by the redelivered blob event, so a
    // Handler that already ran can run twice. Only the handlers IsIdempotentAzureFunctionMap marks idempotent get
    // Here for exactly that reason; the rest were quarantined above rather than duplicated.
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
