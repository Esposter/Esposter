import { getSignedText, SignaturePurpose } from "agent-console-server/contracts";

// Whether one of the MACs the host answered the page's challenge with is made under the pairing code the page holds. The
// Code has crossed to nothing yet, so a program answering on the port without it cannot make one, and is sent nothing
export const checkIsPairingProofValid = async (
  code: string,
  port: number,
  nonce: string,
  pairingProofs: string[],
): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["verify"],
  );
  const text = new TextEncoder().encode(getSignedText(SignaturePurpose.PairingProof, port, nonce));
  const results = await Promise.all(
    pairingProofs.map((pairingProof) =>
      crypto.subtle.verify("HMAC", key, Uint8Array.fromBase64(pairingProof, { alphabet: "base64url" }), text),
    ),
  );
  return results.includes(true);
};
