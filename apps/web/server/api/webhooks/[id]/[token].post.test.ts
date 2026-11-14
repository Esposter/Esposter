import type { H3Event } from "nuxt/server";

import callWebhook from "#server/api/webhooks/[id]/[token].post";
import { generateSecretToken } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

const { findFirst, send } = vi.hoisted(() => ({
  findFirst: vi.fn<(query: unknown) => Promise<unknown>>(),
  send: vi.fn<(job: unknown) => Promise<void>>(),
}));

vi.mock("#server/db", () => ({ db: { query: { webhooksInMessage: { findFirst } } } }));
vi.mock("#server/services/queue/getJobQueue", () => ({ getJobQueue: () => ({ send }) }));
vi.mock("#server/services/rateLimiter/consumeAddressRateLimit", () => ({
  consumeAddressRateLimit: () => Promise.resolve(),
}));
vi.mock("#server/services/rateLimiter/webhookRateLimiter", () => ({
  webhookRateLimiter: { consume: () => Promise.resolve() },
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

describe("api/webhooks/[id]/[token]", () => {
  const webhookId = v7();
  const roomId = v7();
  const userId = v7();
  const storedToken = generateSecretToken();

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("refuses a token that differs from the stored one only in its last character, as a wrong token", async () => {
    expect.hasAssertions();

    // A guess that matches every character but the last is the attack a byte-by-byte search makes, so it is refused as
    // any other wrong token, with the same 404 an unknown id gets
    const lastCharacter = storedToken.at(-1) === "A" ? "B" : "A";
    findFirst.mockResolvedValueOnce({ roomId, token: storedToken, userId });
    const event = createEvent(webhookId, `${storedToken.slice(0, -1)}${lastCharacter}`);

    await callWebhook(event);

    expect(event.res.status).toBe(404);
    expect(send).not.toHaveBeenCalled();
  });

  test("queues the payload with the room and its app user, never the token", async () => {
    expect.hasAssertions();

    findFirst.mockResolvedValueOnce({ roomId, token: storedToken, userId });
    const event = createEvent(webhookId, storedToken);

    await callWebhook(event);

    expect(event.res.status).toBe(202);
    expect(send).toHaveBeenCalledTimes(1);
    const [job] = send.mock.calls.at(-1) ?? [];
    expect(job).toMatchObject({ webhook: { roomId, userId } });
    expect(JSON.stringify(job)).not.toContain(storedToken);
  });
});
