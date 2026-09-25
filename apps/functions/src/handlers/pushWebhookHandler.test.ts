import type { Database } from "@esposter/db-schema";

import { pushWebhookHandler } from "#src/handlers/pushWebhookHandler";
import { webhookEventGridDataSchema } from "#src/models/message/WebhookEventGridData";
import { MOCK_EVENT_GRID_ENDPOINT } from "#src/services/azure/constants.test";
import { createUser } from "#src/services/shared/createUser.test";
import { HttpRequest, InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { appUsersInMessage, roomsInMessage, users, webhooksInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(
  import("#src/services/azure/eventGridPublisherClient"),
  () => import("#src/services/azure/eventGridPublisherClient.test"),
);

const createMockRequest = (parameters: Record<string, string>, bodyString?: string): HttpRequest =>
  new HttpRequest({
    method: "POST",
    params: parameters,
    url: "http://localhost",
    ...(bodyString !== undefined && { body: { string: bodyString } }),
  });

describe(pushWebhookHandler, () => {
  const name = "name";
  const token = "token";
  const context = new InvocationContext();
  const seedWebhook = async () => {
    const userId = crypto.randomUUID();
    await mockDb.insert(users).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const appUser = takeOne(await mockDb.insert(appUsersInMessage).values({ name }).returning());
    return takeOne(
      await mockDb
        .insert(webhooksInMessage)
        .values({ creatorId: userId, name, roomId: room.id, token, userId: appUser.id })
        .returning(),
    );
  };

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    await mockDb.delete(users);
    await mockDb.delete(appUsersInMessage);
    MockEventGridDatabase.clear();
  });

  test("returns 404 when webhook not found", async () => {
    expect.hasAssertions();

    const response = await pushWebhookHandler(createMockRequest({ id: crypto.randomUUID(), token }), context);

    expect(response?.status).toBe(404);
  });

  test("returns 400 when id param is not a UUID", async () => {
    expect.hasAssertions();

    const response = await pushWebhookHandler(createMockRequest({ id: "", token }), context);

    expect(response?.status).toBe(400);
  });

  test("returns 400 when body is malformed JSON", async () => {
    expect.hasAssertions();

    const webhook = await seedWebhook();

    const response = await pushWebhookHandler(createMockRequest({ id: webhook.id, token }, "{"), context);

    expect(response?.status).toBe(400);
  });

  // A message has nowhere to store an embed, so an embed-only payload is refused rather than acknowledged and then
  // Posted as an empty message
  test("returns 400 when the body carries embeds but no content", async () => {
    expect.hasAssertions();

    const webhook = await seedWebhook();

    const response = await pushWebhookHandler(
      createMockRequest({ id: webhook.id, token }, JSON.stringify({ embeds: [{ title: name }] })),
      context,
    );

    expect(response?.status).toBe(400);
  });

  test("returns 202 and publishes event when webhook found", async () => {
    expect.hasAssertions();

    const content = "content";
    const webhook = await seedWebhook();

    const response = await pushWebhookHandler(
      createMockRequest({ id: webhook.id, token }, JSON.stringify({ content })),
      context,
    );

    expect(response?.status).toBe(202);

    const events = MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });

  test("publishes the content sanitized like any other message body", async () => {
    expect.hasAssertions();

    const content = "content";
    const webhook = await seedWebhook();

    await pushWebhookHandler(
      createMockRequest(
        { id: webhook.id, token },
        JSON.stringify({ content: `<script>${content}</script>${content}` }),
      ),
      context,
    );

    const events = MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT);
    assert.exists(events);

    expect(webhookEventGridDataSchema.parse(takeOne(events).data).payload.content).toBe(content);
  });
});
