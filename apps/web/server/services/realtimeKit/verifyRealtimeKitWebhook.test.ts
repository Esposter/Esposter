import { REALTIMEKIT_WEBHOOK_KEY_URL } from "#server/services/realtimeKit/constants";
import { createRealtimeKitWebhookSigner } from "#server/services/realtimeKit/createRealtimeKitWebhookSigner.test";
import { verifyRealtimeKitWebhook } from "#server/services/realtimeKit/verifyRealtimeKitWebhook";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(verifyRealtimeKitWebhook, () => {
  const body = new TextEncoder().encode("").buffer as ArrayBuffer;
  let signer: Awaited<ReturnType<typeof createRealtimeKitWebhookSigner>>;

  beforeAll(async () => {
    signer = await createRealtimeKitWebhookSigner();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The key is served at RealtimeKit's well-known URL, which is the only place this process learns it
  const stubPublishedKey = () =>
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ data: { publicKey: signer.publicKeyPem } })))),
    );

  test("accepts a delivery signed with the published key", async () => {
    expect.hasAssertions();

    stubPublishedKey();
    const signature = await signer.sign(body);

    await expect(verifyRealtimeKitWebhook(body, signature)).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(REALTIMEKIT_WEBHOOK_KEY_URL);
  });

  test("refuses a body changed after it was signed", async () => {
    expect.hasAssertions();

    stubPublishedKey();
    const signature = await signer.sign(body);
    const tamperedBody = new TextEncoder().encode(" ").buffer as ArrayBuffer;

    await expect(verifyRealtimeKitWebhook(tamperedBody, signature)).resolves.toBe(false);
  });
});
