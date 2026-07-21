import type { EventGridEvent } from "@azure/functions";
import type { EventGridEventInput } from "@esposter/db-schema";

import { replayDeadLetterEventHandler } from "@/handlers/replayDeadLetterEventHandler";
import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "@/services/constants";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { MOCK_EVENT_GRID_ENDPOINT } from "@/services/eventGridPublisherClient.test";
import { getContainerClient } from "@/services/getContainerClient";
import { InvocationContext } from "@azure/functions";
import {
  AzureContainer,
  AzureFunction,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_BLOB_SUBJECT_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
} from "@esposter/db-schema";
import { getResult, ID_SEPARATOR, noop } from "@esposter/shared";
import { MockBlockBlobClient, MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/eventGridPublisherClient"), () => import("@/services/eventGridPublisherClient.test"));
vi.mock(import("@/services/getContainerClient"), () => import("@/services/getContainerClient.test"));

const readContainer = () => {
  const container = MockContainerDatabase.get(AzureContainer.DeadLetter);
  assert.exists(container);
  return Object.fromEntries([...container].map(([name, buffer]) => [name, buffer.toString("utf8")]));
};

describe(replayDeadLetterEventHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const blobName = "";
  const data = "data";
  const dataVersion = "1.0";
  const eventType = AzureFunction.ProcessPushNotification;
  const subject = "subject";
  const eventId = crypto.randomUUID();
  const secondEventId = crypto.randomUUID();
  const createDeadLetteredEvent = (id: string, type: AzureFunction = eventType): EventGridEventInput<unknown> => ({
    data,
    dataVersion,
    eventType: type,
    id,
    subject,
  });
  const createEvent = (blobSubject: string): EventGridEvent => ({
    data: {},
    dataVersion,
    eventTime: "1970-01-01T00:00:00.000Z",
    eventType: "",
    id: crypto.randomUUID(),
    metadataVersion: "1",
    subject: blobSubject,
    topic: "",
  });
  const seedBlob = async (content: string, name: string = blobName) => {
    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    await containerClient.getBlockBlobClient(name).upload(content, content.length);
  };

  afterEach(() => {
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    vi.restoreAllMocks();
  });

  test("ignores a blob outside the dead-letter subject prefix", async () => {
    expect.hasAssertions();

    const content = JSON.stringify([createDeadLetteredEvent(eventId)]);
    await seedBlob(content);
    await replayDeadLetterEventHandler(createEvent(""), context);

    expect(readContainer()).toStrictEqual({ [blobName]: content });
    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
  });

  test.each([DEAD_LETTER_ARCHIVED_PREFIX, DEAD_LETTER_QUARANTINE_PREFIX])(
    "ignores the %s copy it wrote itself",
    async (prefix) => {
      expect.hasAssertions();

      const content = JSON.stringify([createDeadLetteredEvent(eventId)]);
      await seedBlob(content, `${prefix}${blobName}`);
      await replayDeadLetterEventHandler(
        createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${prefix}${blobName}`),
        context,
      );

      expect(readContainer()).toStrictEqual({ [`${prefix}${blobName}`]: content });
      expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
    },
  );

  test("republishes both copies of a repeated id rather than quarantining the batch", async () => {
    expect.hasAssertions();

    const content = JSON.stringify([createDeadLetteredEvent(eventId), createDeadLetteredEvent(eventId)]);
    await seedBlob(content);
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toStrictEqual([
      createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}1`),
      createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}1`),
    ]);
    expect(readContainer()).toStrictEqual({ [`${DEAD_LETTER_ARCHIVED_PREFIX}${blobName}`]: content });
  });

  test("republishes never-replayed events, then archives and deletes the original", async () => {
    expect.hasAssertions();

    const content = JSON.stringify([createDeadLetteredEvent(eventId), createDeadLetteredEvent(secondEventId)]);
    await seedBlob(content);
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toStrictEqual([
      createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}1`),
      createDeadLetteredEvent(`${secondEventId}${ID_SEPARATOR}1`),
    ]);
    expect(readContainer()).toStrictEqual({ [`${DEAD_LETTER_ARCHIVED_PREFIX}${blobName}`]: content });
  });

  test("quarantines every event already at the replay cap without republishing", async () => {
    expect.hasAssertions();

    const cappedEvents = [
      createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`),
      createDeadLetteredEvent(`${secondEventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`),
    ];
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(JSON.stringify(cappedEvents));
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
    expect(readContainer()).toStrictEqual({
      [`${DEAD_LETTER_QUARANTINE_PREFIX}${blobName}`]: JSON.stringify(cappedEvents),
    });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      `${AzureFunction.ReplayDeadLetterEvent} quarantined 2 of 2 events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times or raised by a handler a replay cannot safely rerun`,
    );
  });

  test("caps per event: quarantines the capped event and republishes the rest of the batch", async () => {
    expect.hasAssertions();

    const cappedEvent = createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`);
    const replayableEvent = createDeadLetteredEvent(
      `${secondEventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS - 1}`,
    );
    const content = JSON.stringify([cappedEvent, replayableEvent]);
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(content);
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toStrictEqual([
      createDeadLetteredEvent(`${secondEventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`),
    ]);
    expect(readContainer()).toStrictEqual({
      [`${DEAD_LETTER_ARCHIVED_PREFIX}${blobName}`]: content,
      [`${DEAD_LETTER_QUARANTINE_PREFIX}${blobName}`]: JSON.stringify([cappedEvent]),
    });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      `${AzureFunction.ReplayDeadLetterEvent} quarantined 1 of 2 events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times or raised by a handler a replay cannot safely rerun`,
    );
  });

  test("quarantines a non-idempotent handler's event rather than duplicating the work it already did", async () => {
    expect.hasAssertions();

    const webhookEvent = createDeadLetteredEvent(eventId, AzureFunction.ProcessWebhook);
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(JSON.stringify([webhookEvent]));
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
    expect(readContainer()).toStrictEqual({
      [`${DEAD_LETTER_QUARANTINE_PREFIX}${blobName}`]: JSON.stringify([webhookEvent]),
    });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      `${AzureFunction.ReplayDeadLetterEvent} quarantined 1 of 1 events from ${blobName}, each already replayed ${MAX_DEAD_LETTER_REPLAY_ATTEMPTS} times or raised by a handler a replay cannot safely rerun`,
    );
  });

  test("no-ops on a redelivery whose blob a prior delivery already replayed and deleted", async () => {
    expect.hasAssertions();

    const errorSpy = vi.spyOn(context, "error");

    await expect(
      replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context),
    ).resolves.toBeUndefined();

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("logs a failing delete of a quarantined original without rethrowing", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    const malformedContent = "";
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(malformedContent);
    vi.spyOn(MockBlockBlobClient.prototype, "delete").mockRejectedValue(error);
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(errorSpy).toHaveBeenLastCalledWith(
      `${AzureFunction.ReplayDeadLetterEvent} left ${blobName} undeleted: `,
      error,
    );
  });

  test("quarantines a malformed payload verbatim without republishing", async () => {
    expect.hasAssertions();

    const malformedContent = "";
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(malformedContent);
    await replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
    expect(readContainer()).toStrictEqual({ [`${DEAD_LETTER_QUARANTINE_PREFIX}${blobName}`]: malformedContent });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      `${AzureFunction.ReplayDeadLetterEvent} quarantined ${blobName}, malformed dead-letter payload: `,
      getResult(() => JSON.parse(malformedContent) as unknown).match(noop, (error) => error),
    );
  });

  test("logs a failing archive without rethrowing, leaving the original in place", async () => {
    expect.hasAssertions();

    const content = JSON.stringify([createDeadLetteredEvent(eventId)]);
    const error = new Error(" ");
    const errorSpy = vi.spyOn(context, "error");
    await seedBlob(content);
    vi.spyOn(MockBlockBlobClient.prototype, "upload").mockRejectedValue(error);

    await expect(
      replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context),
    ).resolves.toBeUndefined();

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toStrictEqual([
      createDeadLetteredEvent(`${eventId}${ID_SEPARATOR}1`),
    ]);
    expect(readContainer()).toStrictEqual({ [blobName]: content });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      `${AzureFunction.ReplayDeadLetterEvent} failed to archive ${blobName}: `,
      error,
    );
  });

  test("rethrows a failing send so Event Grid redelivers the blob", async () => {
    expect.hasAssertions();

    const content = JSON.stringify([createDeadLetteredEvent(eventId)]);
    await seedBlob(content);
    vi.spyOn(eventGridPublisherClient, "send").mockRejectedValue(new Error(" "));

    await expect(
      replayDeadLetterEventHandler(createEvent(`${DEAD_LETTER_BLOB_SUBJECT_PREFIX}${blobName}`), context),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(readContainer()).toStrictEqual({ [blobName]: content });
  });
});
