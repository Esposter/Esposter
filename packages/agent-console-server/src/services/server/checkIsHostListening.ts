import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";
import { HOST_CHALLENGE_HEADER, HOST_PROBE_TIMEOUT_MS, TOKEN_BYTE_LENGTH } from "#src/services/server/constants";
import { getHostProof } from "#src/services/server/getHostProof";
import { getResultAsync } from "@esposter/shared";
import { randomBytes } from "node:crypto";

// Whether an Esposter host holds the address: only one answers a fresh challenge signed by this machine's token. The
// Token itself is never sent, since whatever holds the port is a stranger until it answers
export const checkIsHostListening = async (hostname: string, port: number, token: string): Promise<boolean> => {
  const challenge = randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
  const proof = await getResultAsync(async () => {
    const response = await fetch(`http://${hostname}:${port}/`, {
      headers: { [HOST_CHALLENGE_HEADER]: challenge },
      signal: AbortSignal.timeout(HOST_PROBE_TIMEOUT_MS),
    });
    return response.text();
  }).match(
    (text) => text,
    () => "",
  );
  return checkIsTokenValid(proof, getHostProof(challenge, port, token));
};
