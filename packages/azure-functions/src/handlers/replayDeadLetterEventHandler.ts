import type { EventGridHandler } from "@azure/functions";

import { checkIsReplayable } from "#src/services/checkIsReplayable";
import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "#src/services/constants";
import { deleteReplayedBlob } from "#src/services/deleteReplayedBlob";
import { eventGridPublisherClient } from "#src/services/eventGridPublisherClient";
import { formatReplayId } from "#src/services/formatReplayId";
import { getContainerClient } from "#src/services/getContainerClient";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { parseReplayId } from "#src/services/parseReplayId";
import { writeDeadLetterBlob } from "#src/services/writeDeadLetterBlob";
import {
  AzureContainer,
  AzureFunction,
  createEventGridEventSchema,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
  DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX,
  MAX_EVENT_GRID_PUBLISH_BYTES,
  MAX_EVENT_GRID_PUBLISH_EVENT_COUNT,
} from "@esposter/db-schema";
import { chunkBySerializedSize, getResult, getResultAsync, noop, takeOne } from "@esposter/shared";
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
    let parseError: Error | undefined;
    // Decoded and JSON-parsed once and reused: a dead-letter blob carries up to a megabyte of events, and the
    // Raw objects are needed again below to write a quarantine copy that keeps Event Grid's diagnostics
    // eslint-disable-next-line no-restricted-syntax -- a dead-letter payload is replayed and quarantined verbatim, so no value is rewritten on the way through
    const rawEvents = getResult(() => JSON.parse(content.toString("utf8")) as unknown)
      .orTee((error) => {
        parseError = error;
      })
      .unwrapOr(undefined);
    // A blob that is not JSON at all reports its own syntax error rather than the schema's "expected array",
    // Which is what an operator opening the quarantine copy needs to see
    const events =
      parseError === undefined
        ? getResult(() => deadLetteredEventsSchema.parse(rawEvents))
            .orTee((error) => {
              parseError = error;
            })
            .unwrapOr(undefined)
        : undefined;
    // A blob that is not a dead-letter event array can never become publishable, so it is quarantined
    // Rather than republished — republishing a broken payload would just dead-letter it again.
    if (!events) {
      const isQuarantineCreated = await writeDeadLetterBlob(
        containerClient,
        blobName,
        DEAD_LETTER_QUARANTINE_PREFIX,
        content,
      );
      // Rewriting the quarantine copy is harmless — same path, same bytes — but this line is the only record that the
      // Quarantine happened, so it is tied to the delivery that created the copy: a redelivery of an already
      // Quarantined payload is not a new incident, and delivery is at-least-once. Nothing pages on it — the alert
      // Rules went with App Insights, and the container is what an operator inspects (/docs/infra/eventgrid-dead-letter)
      if (isQuarantineCreated)
        context.error(
          `${AzureFunction.ReplayDeadLetterEvent}${DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX} ${blobName}, malformed dead-letter payload: `,
          parseError,
        );
      await deleteReplayedBlob(context, blockBlobClient, blobName);
      return;
    }
    // Judged per event, not per blob: Event Grid batches whatever expired together, so one poison payload must not
    // Strand the transient failures sharing its blob, and a blob-level count would be meaningless anyway once the
    // Batch splits across cycles. Both bars — the replay cap and handler idempotency — are `checkIsReplayable`'s.
    // The raw objects parsed above stay index-aligned with the narrowed events: the schema keeps only the five
    // Fields a republish needs, dropping Event Grid's dead-letter diagnostics — `deadLetterReason`,
    // `deliveryAttempts` and `lastDeliveryOutcome`. Those are the only record of WHY a payload is here, which is the
    // Entire point of the copy an operator opens, so the quarantine copy is written from the raw objects
    // Typed, not re-validated: reaching here means the array schema above already parsed `rawEvents`, so this
    // Cannot reject. Expressing it as a fallback (`Array.isArray(...) ? ... : []`, an element-shape check) would
    // Read as though the two arrays might diverge in length or shape — the one thing the comment above rules out
    const rawEventArray = z.looseObject({}).array().parse(rawEvents);
    const replays = events.map((deadLetteredEvent, index) => {
      const { eventId, replayAttempts } = parseReplayId(deadLetteredEvent.id);
      return {
        deadLetteredEvent,
        eventId,
        index,
        isReplayable: checkIsReplayable(deadLetteredEvent.eventType, replayAttempts),
        replayAttempts,
      };
    });
    const quarantinedReplays = replays.filter(({ isReplayable }) => !isReplayable);
    const replayableReplays = replays.filter(({ isReplayable }) => isReplayable);
    if (quarantinedReplays.length > 0) {
      const isQuarantineCreated = await writeDeadLetterBlob(
        containerClient,
        blobName,
        DEAD_LETTER_QUARANTINE_PREFIX,
        // Written from the raw objects so the diagnostics survive, and with the replay count stripped back off
        // The id: the documented recovery is an operator moving this blob to the container root once the
        // Downstream handler is fixed, and an id still carrying the cap is re-quarantined on sight — deleting
        // The copy the operator just restored and silently no-opping their remediation
        Buffer.from(
          JSON.stringify(
            quarantinedReplays.map(({ eventId, index }) => ({ ...takeOne(rawEventArray, index), id: eventId })),
          ),
        ),
      );
      // Quarantining stays ahead of the republish so a poison payload never rides along in the resend batch, which
      // Means a send that throws below reruns this whole step on the redelivered blob. Rewriting the quarantine copy
      // Is harmless — same path, same bytes — but this line is the only record that the quarantine happened, so it is
      // Tied to the delivery that created the copy: a redelivery of an already-quarantined payload is not a new
      // Incident. Nothing pages on it; the container is what an operator inspects (/docs/infra/eventgrid-dead-letter)
      if (isQuarantineCreated)
        context.error(
          `${AzureFunction.ReplayDeadLetterEvent}${DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX} ${quarantinedReplays.length} of ${replays.length} events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times or raised by a handler a replay cannot safely rerun`,
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
    // Handler that already ran can run twice. Only the handlers AzureFunctionIsIdempotentMap marks idempotent get
    // Here for exactly that reason; the rest were quarantined above rather than duplicated.
    // Chunked against the publish request cap, never sent whole: Event Grid caps a publish REQUEST at 1 MB
    // Independently of the per-event cap, and it batches whatever expired together into one blob up to that same
    // 1 MB — so a full blob is by definition more than one request may carry. Sent whole, the request is rejected,
    // `logAndRethrow` redelivers the identical oversized batch, and the replay subscription (which deliberately has
    // No dead-letter destination of its own) burns every attempt on it before discarding the blob's events silently.
    // Both bounds at once, because the request has two: a blob of many tiny events (a bare subject and an empty
    // `data` serialize to a couple of hundred bytes) stays under the byte budget the whole way and still crosses
    // The 5,000-event count, which is rejected exactly as loudly and burns the attempts exactly the same way
    // Sequential, so a chunk that throws stops the ones behind it: the redelivered blob replays the batch from the
    // Start, and every event that already landed is a duplicate the idempotency bar above admits
    for (const replayChunk of chunkBySerializedSize(
      replayableReplays.map(
        ({ deadLetteredEvent: { data, dataVersion, eventType, subject }, eventId, replayAttempts }) => ({
          data,
          dataVersion,
          eventType,
          id: formatReplayId({ eventId, replayAttempts: replayAttempts + 1 }),
          subject,
        }),
      ),
      MAX_EVENT_GRID_PUBLISH_BYTES,
      MAX_EVENT_GRID_PUBLISH_EVENT_COUNT,
    ))
      await eventGridPublisherClient.send(replayChunk);
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
