import type { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";

// The text a nonce's signature covers: the purpose first, so a signature made for one purpose never passes for another
export const getSignedText = (purpose: SignaturePurpose, nonce: string): string => `${purpose}:${nonce}`;
