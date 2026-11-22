import { REALTIMEKIT_WEBHOOK_ALGORITHM } from "#server/services/realtimeKit/constants";
import { describe } from "vitest";

// Signs deliveries the way RealtimeKit does: an RSA key pair, whose public half is the PEM RealtimeKit serves at its
// Well-known URL, and an RSASSA-PKCS1-v1_5 signature over a delivery's raw body
export const createRealtimeKitWebhookSigner = async () => {
  const keyPair = await crypto.subtle.generateKey(
    { ...REALTIMEKIT_WEBHOOK_ALGORITHM, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ["sign", "verify"],
  );
  return {
    publicKeyPem: `-----BEGIN PUBLIC KEY-----\n${new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey)).toBase64()}\n-----END PUBLIC KEY-----`,
    sign: async (body: ArrayBuffer) =>
      new Uint8Array(await crypto.subtle.sign(REALTIMEKIT_WEBHOOK_ALGORITHM.name, keyPair.privateKey, body)).toBase64(),
  };
};

describe.todo("createRealtimeKitWebhookSigner");
