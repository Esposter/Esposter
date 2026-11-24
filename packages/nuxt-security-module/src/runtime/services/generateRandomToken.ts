// `byteLength` random bytes from the platform's CSPRNG, base64url encoded without padding.
// A value with no `+`, `/` or `=` is the same once a cookie encodes and decodes it.
// So the page can copy it as it reads it.
// Web Crypto is global on every runtime the module ships to, so no runtime module is imported to get it.
export const generateRandomToken = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return bytes.toBase64({ alphabet: "base64url", omitPadding: true });
};
