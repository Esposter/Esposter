import { getSignedText, SignaturePurpose } from "agent-console-server/contracts";

// Whether the host's answer to the page's challenge is signed by the key the page was given when it paired: a program
// Answering on the port without that key cannot make it, and is sent nothing
export const checkIsHostProofValid = async (
  publicKey: string,
  port: number,
  nonce: string,
  signature: string,
): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    "jwk",
    { crv: "Ed25519", kty: "OKP", x: publicKey },
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    { name: "Ed25519" },
    key,
    Uint8Array.fromBase64(signature, { alphabet: "base64url" }),
    new TextEncoder().encode(getSignedText(SignaturePurpose.HostProof, port, nonce)),
  );
};
