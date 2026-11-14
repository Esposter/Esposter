import { describe } from "vitest";

// Signs deliveries the way RealtimeKit does: an RSA key pair, whose public half is the PEM RealtimeKit serves at its
// well-known URL, and an RSASSA-PKCS1-v1_5 signature over a delivery's raw body
export const createRealtimeKitWebhookSigner = async () => {
  const RSA_ALGORITHM = { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" };
  const toBase64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const keyPair = await crypto.subtle.generateKey(
    { ...RSA_ALGORITHM, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ["sign", "verify"],
  );
  return {
    publicKeyPem: `-----BEGIN PUBLIC KEY-----\n${toBase64(await crypto.subtle.exportKey("spki", keyPair.publicKey))}\n-----END PUBLIC KEY-----`,
    sign: async (body: ArrayBuffer) => toBase64(await crypto.subtle.sign(RSA_ALGORITHM.name, keyPair.privateKey, body)),
  };
};

describe.todo("createRealtimeKitWebhookSigner");
