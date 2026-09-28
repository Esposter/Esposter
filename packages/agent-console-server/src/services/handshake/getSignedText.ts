import type { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";

// The text a nonce's signature covers: the purpose first, so a signature made for one purpose never passes for another,
// And the port the host answers on, so a program on another port that relays a challenge to the host gets back a proof
// For the host's port rather than its own
export const getSignedText = (purpose: SignaturePurpose, port: number, nonce: string): string =>
  `${purpose}:${port}:${nonce}`;
