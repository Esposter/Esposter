// One step of SigV4's key derivation and its final signature: an HMAC-SHA256 of the text under the key
export const hmacSha256 = async (key: BufferSource | string, text: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(text));
};
