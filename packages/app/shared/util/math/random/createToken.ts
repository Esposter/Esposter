export const TOKEN_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createToken = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => TOKEN_CHARACTERS.charAt(byte % TOKEN_CHARACTERS.length)).join("");
};
