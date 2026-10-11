import { NONCE_BYTE_LENGTH } from "#src/runtime/constants";
import { generateRandomToken } from "#src/runtime/services/generateRandomToken";

// A fresh nonce from the platform's CSPRNG, so every response carries its own.
// A reader of one learns nothing of the next.
export const generateNonce = (): string => generateRandomToken(NONCE_BYTE_LENGTH);
