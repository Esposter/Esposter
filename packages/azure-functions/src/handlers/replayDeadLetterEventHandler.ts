import type { EventGridHandler } from "@azure/functions";

import { deadLetteredEventSchema } from "@/models/DeadLetteredEvent";
import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS, REPLAY_ATTEMPTS_METADATA_KEY } from "@/services/constants";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
import { moveDeadLetterBlob } from "@/services/moveDeadLetterBlob";
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
    const [content, { metadata }] = await Promise.all([
      blockBlobClient.downloadToBuffer(),
      blockBlobClient.getProperties(),
    ]);
    const replayAttempts = Number(metadata?.[REPLAY_ATTEMPTS_METADATA_KEY] ?? 0);
    if (replayAttempts >= MAX_DEAD_LETTER_REPLAY_ATTEMPTS) {
      await moveDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content, replayAttempts);
      context.error(
        `${AzureFunction.ReplayDeadLetterEvent} quarantined ${blobName} after ${replayAttempts} replay attempts, capped at ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`,
      );
      return;
    }

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
      await moveDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content, replayAttempts);
      return;
    }

    // The counter must land before the republish: if publishing throws, the retried delivery of this same
    // BlobCreated event reads the incremented count and eventually trips the cap instead of cycling forever.
    const nextReplayAttempts = replayAttempts + 1;
    await blockBlobClient.setMetadata({ [REPLAY_ATTEMPTS_METADATA_KEY]: String(nextReplayAttempts) });
    await eventGridPublisherClient.send(
      events.map(({ data, dataVersion, eventType, subject }) => ({ data, dataVersion, eventType, subject })),
    );
    // Best-effort like every post-persist step: the events are already republished, so a failed archive must
    // Not rethrow and redeliver them. The blob keeps its incremented counter and the next cycle caps it out.
    await getResultAsync(() =>
      moveDeadLetterBlob(containerClient, blobName, DEAD_LETTER_ARCHIVED_PREFIX, content, nextReplayAttempts),
    ).match(noop, (error) => {
      context.error(`${AzureFunction.ReplayDeadLetterEvent} failed to archive ${blobName}: `, error);
    });
  }).match(noop, logAndRethrow(context, AzureFunction.ReplayDeadLetterEvent));
};
