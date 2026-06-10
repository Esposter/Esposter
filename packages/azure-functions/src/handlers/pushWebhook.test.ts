import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { pushWebhook } from "@/handlers/pushWebhook";
import { MOCK_EVENT_GRID_ENDPOINT } from "@/services/eventGridPublisherClient.test";
import { HttpRequest, InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { appUsersInMessage, roomsInMessage, users, webhooksInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/eventGridPublisherClient"), () => import("@/services/eventGridPublisherClient.test"));

const createMockRequest = (params: Record<string, string>, bodyString?: string): HttpRequest =>
  new HttpRequest({
    method: "POST",
    params,
    url: "http://localhost",
    ...(bodyString !== undefined && { body: { string: bodyString } }),
  });

describe(pushWebhook, () => {
  const token = "token";
  const context = new InvocationContext({ logHandler: () => {} });

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    await mockDb.delete(webhooksInMessage);
    await mockDb.delete(roomsInMessage);
    await mockDb.delete(appUsersInMessage);
    MockEventGridDatabase.clear();
  });

  test("returns 404 when webhook not found", async () => {
    expect.hasAssertions();

    const result = await pushWebhook(createMockRequest({ id: crypto.randomUUID(), token }), context);

    expect(result?.status).toBe(404);
  });

  test("returns 400 when id param is not a UUID", async () => {
    expect.hasAssertions();

    const result = await pushWebhook(createMockRequest({ id: "not-a-uuid", token }), context);

    expect(result?.status).toBe(400);
  });

  test("returns 400 when body is malformed JSON", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name: "" });
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ userId }).returning());
    const appUser = takeOne(await mockDb.insert(appUsersInMessage).values({ name: "Bot" }).returning());
    const webhook = takeOne(
      await mockDb
        .insert(webhooksInMessage)
        .values({ creatorId: userId, roomId: room.id, token, userId: appUser.id })
        .returning(),
    );

    const result = await pushWebhook(createMockRequest({ id: webhook.id, token }, "{invalid"), context);

    expect(result?.status).toBe(400);
  });

  test("returns 202 and publishes event when webhook found", async () => {
    expect.hasAssertions();

    const content = "content";
    const userId = crypto.randomUUID();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name: "" });
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ userId }).returning());
    const appUser = takeOne(await mockDb.insert(appUsersInMessage).values({ name: "Bot" }).returning());
    const webhook = takeOne(
      await mockDb
        .insert(webhooksInMessage)
        .values({ creatorId: userId, roomId: room.id, token, userId: appUser.id })
        .returning(),
    );

    const result = await pushWebhook(
      createMockRequest({ id: webhook.id, token }, JSON.stringify({ content })),
      context,
    );

    expect(result?.status).toBe(202);

    const events = MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });
});
