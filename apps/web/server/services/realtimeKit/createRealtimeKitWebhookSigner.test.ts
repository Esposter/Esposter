import { REALTIMEKIT_WEBHOOK_ALGORITHM } from "#server/services/realtimeKit/constants";
import { describe } from "vitest";

const toBase64 = (bytes: ArrayBuffer) => btoa(String.fromCodePoint(...new Uint8Array(bytes)));

// Signs deliveries the way RealtimeKit does: an RSA key pair, whose public half is the PEM RealtimeKit serves at its
// Well-known URL, and an RSASSA-PKCS1-v1_5 signature over a delivery's raw body
export const createRealtimeKitWebhookSigner = async () => {
  const keyPair = await crypto.subtle.generateKey(
    { ...REALTIMEKIT_WEBHOOK_ALGORITHM, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ["sign", "verify"],
  );
  return {
    publicKeyPem: `-----BEGIN PUBLIC KEY-----\n${toBase64(await crypto.subtle.exportKey("spki", keyPair.publicKey))}\n-----END PUBLIC KEY-----`,
    sign: async (body: ArrayBuffer) =>
      toBase64(await crypto.subtle.sign(REALTIMEKIT_WEBHOOK_ALGORITHM.name, keyPair.privateKey, body)),
  };
};

describe.todo("createRealtimeKitWebhookSigner");
