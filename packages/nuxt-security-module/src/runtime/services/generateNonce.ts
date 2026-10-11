import { NONCE_BYTE_LENGTH } from "#src/runtime/constants";

// A fresh nonce from the platform's CSPRNG, so every response carries its own.
// A reader of one learns nothing of the next.
export const generateNonce = (): string => {
  const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  return btoa(String.fromCodePoint(...bytes));
};
