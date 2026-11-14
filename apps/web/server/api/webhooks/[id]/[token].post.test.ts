import type { H3Event } from "nuxt/server";

import callWebhook from "#server/api/webhooks/[id]/[token].post";
import { generateSecretToken, hashSecretToken, takeOne } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

interface LookupQuery {
  where: { id: { eq: string }; isActive: { eq: boolean }; tokenHash: { eq: string } };
}
interface StoredWebhook {
  id: string;
  isActive: boolean;
  roomId: string;
  tokenHash: string;
  userId: string;
}

const { findFirst, send } = vi.hoisted(() => ({
  findFirst: vi.fn<(query: LookupQuery) => Promise<unknown>>(),
  send: vi.fn<(job: { webhook: unknown }) => Promise<void>>(),
}));

vi.mock(import("#server/db"), () => ({ db: { query: { webhooksInMessage: { findFirst } } } }));
vi.mock(import("#server/services/queue/getJobQueue"), () => ({ getJobQueue: () => ({ send }) }));
vi.mock(import("#server/services/rateLimiter/consumeAddressRateLimit"), () => ({
  consumeAddressRateLimit: () => Promise.resolve(true),
}));

const createEvent = (id: string, token: string) =>
  ({
    context: { params: { id, token } },
    req: new Request(`https://esposter.com/api/webhooks/${id}/${token}`, {
      body: JSON.stringify({ content: "hello" }),
      method: "POST",
    }),
    res: { status: 200 },
  }) as unknown as H3Event;

// Answers the lookup as the table would for one row: the row is found only when every condition the query names holds
const storeWebhook = (webhook: StoredWebhook) =>
  findFirst.mockImplementation(({ where }) =>
    Promise.resolve(
      where.id.eq === webhook.id && where.isActive.eq === webhook.isActive && where.tokenHash.eq === webhook.tokenHash
        ? webhook
        : undefined,
    ),
  );

describe("api/webhooks/[id]/[token]", () => {
  const webhookId = v7();
  const roomId = v7();
  const userId = v7();
  const storedToken = generateSecretToken();

  beforeAll(() => {
    // The webhook's own budget is within it for every test here, so the route reaches the lookup
    env.RATE_LIMITER_WEBHOOK = { limit: () => Promise.resolve({ success: true }) };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("refuses a credential that differs from the issued one only in its last character, as a wrong credential", async () => {
    expect.hasAssertions();

    // A guess that matches every character but the last is the attack a byte-by-byte search makes, so it is refused as
    // Any other wrong credential, with the same 404 an unknown id gets
    const lastCharacter = storedToken.at(-1) === "A" ? "B" : "A";
    storeWebhook({ id: webhookId, isActive: true, roomId, tokenHash: await hashSecretToken(storedToken), userId });
    const event = createEvent(webhookId, `${storedToken.slice(0, -1)}${lastCharacter}`);

    await callWebhook(event);

    expect(event.res.status).toBe(404);
    expect(send).not.toHaveBeenCalled();
  });

  test("looks the webhook up by the hash of the credential presented, never by the credential", async () => {
    expect.hasAssertions();

    storeWebhook({ id: webhookId, isActive: true, roomId, tokenHash: await hashSecretToken(storedToken), userId });

    await callWebhook(createEvent(webhookId, storedToken));

    expect(findFirst).toHaveBeenCalledExactlyOnceWith({
      columns: { roomId: true, userId: true },
      where: { id: { eq: webhookId }, isActive: { eq: true }, tokenHash: { eq: await hashSecretToken(storedToken) } },
    });
  });

  test("refuses a deactivated webhook presenting its own credential, as an unknown id", async () => {
    expect.hasAssertions();

    storeWebhook({ id: webhookId, isActive: false, roomId, tokenHash: await hashSecretToken(storedToken), userId });
    const event = createEvent(webhookId, storedToken);

    await callWebhook(event);

    expect(event.res.status).toBe(404);
    expect(send).not.toHaveBeenCalled();
  });

  test("queues the payload with the room and its app user, never the credential", async () => {
    expect.hasAssertions();

    storeWebhook({ id: webhookId, isActive: true, roomId, tokenHash: await hashSecretToken(storedToken), userId });
    const event = createEvent(webhookId, storedToken);

    await callWebhook(event);

    expect(event.res.status).toBe(202);
    expect(send).toHaveBeenCalledTimes(1);
    const [job] = takeOne(send.mock.calls);
    expect(job.webhook).toStrictEqual({ roomId, userId });
    expect(JSON.stringify(job)).not.toContain(storedToken);
  });
});
