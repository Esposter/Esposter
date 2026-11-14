import { REALTIMEKIT_WEBHOOK_KEY_URL } from "#server/services/realtimeKit/constants";
import { z } from "zod";

const RSA_ALGORITHM = { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" };

const decodeBase64 = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

// RealtimeKit signs each delivery's raw body with its RSA key. The key is read per delivery rather than kept, so a
// rotated key is picked up without a restart, and a delivery is judged on the bytes it arrived as
export const verifyRealtimeKitWebhook = async (body: ArrayBuffer, signature: string): Promise<boolean> => {
  const response = await fetch(REALTIMEKIT_WEBHOOK_KEY_URL);
  const { data } = z.object({ data: z.object({ publicKey: z.string() }) }).parse(await response.json());
  const publicKeyBody = data.publicKey.replace(/-----[^-]+-----|\s/gu, "");
  const publicKey = await crypto.subtle.importKey("spki", decodeBase64(publicKeyBody), RSA_ALGORITHM, false, [
    "verify",
  ]);
  return crypto.subtle.verify(RSA_ALGORITHM.name, publicKey, decodeBase64(signature), body);
};
