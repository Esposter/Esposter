// The `algorithm-base64` form a subresource integrity attribute and a policy's source both take.
// The content is hashed as its UTF-8 bytes when it is a string, and as the bytes it already is otherwise
export const generateHash = async (content: string | Uint8Array, hashAlgorithm: string): Promise<string> => {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : new Uint8Array(content);
  const hashBuffer = await globalThis.crypto.subtle.digest(hashAlgorithm, bytes);
  const base64 = btoa(String.fromCodePoint(...new Uint8Array(hashBuffer)));
  return `${hashAlgorithm.replace("-", "").toLowerCase()}-${base64}`;
};
