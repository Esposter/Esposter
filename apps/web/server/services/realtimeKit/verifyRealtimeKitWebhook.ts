import { REALTIMEKIT_WEBHOOK_ALGORITHM, REALTIMEKIT_WEBHOOK_KEY_URL } from "#server/services/realtimeKit/constants";
import { getResult } from "@esposter/shared";
import { z } from "zod";

const decodeBase64 = (value: string) => Uint8Array.from(atob(value), (character) => character.codePointAt(0) ?? 0);

// RealtimeKit signs each delivery's raw body with its RSA key. The key is read per delivery rather than kept, so
// A rotated key is picked up without a restart, and a delivery is judged on the bytes it arrived as
export const verifyRealtimeKitWebhook = async (body: ArrayBuffer, signature: string): Promise<boolean> => {
  // A signature that is not base64 is unverified, not a fault, and it costs no fetch of the key
  const signatureBytes = getResult(() => decodeBase64(signature)).unwrapOr(undefined);
  if (!signature || !signatureBytes) return false;
  const response = await fetch(REALTIMEKIT_WEBHOOK_KEY_URL);
  const { data } = z.object({ data: z.object({ publicKey: z.string() }) }).parse(await response.json());
  const publicKeyBody = data.publicKey.replaceAll(/-----[^-]+-----|\s/gu, "");
  const publicKey = await crypto.subtle.importKey(
    "spki",
    decodeBase64(publicKeyBody),
    REALTIMEKIT_WEBHOOK_ALGORITHM,
    false,
    ["verify"],
  );
  return crypto.subtle.verify(REALTIMEKIT_WEBHOOK_ALGORITHM.name, publicKey, signatureBytes, body);
};
