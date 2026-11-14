import { REALTIMEKIT_WEBHOOK_KEY_URL } from "#server/services/realtimeKit/constants";
import { verifyRealtimeKitWebhook } from "#server/services/realtimeKit/verifyRealtimeKitWebhook";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

const RSA_ALGORITHM = { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" };

const toBase64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

describe(verifyRealtimeKitWebhook, () => {
  const body = new TextEncoder().encode(JSON.stringify({ event: "meeting.participantJoined" })).buffer as ArrayBuffer;
  let privateKey: CryptoKey;
  let publicKeyPem: string;

  beforeAll(async () => {
    const keyPair = await crypto.subtle.generateKey(
      { ...RSA_ALGORITHM, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
      true,
      ["sign", "verify"],
    );
    privateKey = keyPair.privateKey;
    publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${toBase64(await crypto.subtle.exportKey("spki", keyPair.publicKey))}\n-----END PUBLIC KEY-----`;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The key is served at RealtimeKit's well-known URL, which is the only place this process learns it
  const stubPublishedKey = () =>
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ data: { publicKey: publicKeyPem } })))),
    );

  test("accepts a delivery signed with the published key", async () => {
    expect.hasAssertions();

    stubPublishedKey();
    const signature = toBase64(await crypto.subtle.sign(RSA_ALGORITHM.name, privateKey, body));

    await expect(verifyRealtimeKitWebhook(body, signature)).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(REALTIMEKIT_WEBHOOK_KEY_URL);
  });

  test("refuses a body changed after it was signed", async () => {
    expect.hasAssertions();

    stubPublishedKey();
    const signature = toBase64(await crypto.subtle.sign(RSA_ALGORITHM.name, privateKey, body));
    const tamperedBody = new TextEncoder().encode(JSON.stringify({ event: "meeting.participantLeft" }))
      .buffer as ArrayBuffer;

    await expect(verifyRealtimeKitWebhook(tamperedBody, signature)).resolves.toBe(false);
  });
});
