export const TOKEN_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createToken = (length: number): string => {
  const charsetLength = TOKEN_CHARACTERS.length;
  const maxValidByte = 256 - (256 % charsetLength);
  const token: string[] = [];

  while (token.length < length)
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte >= maxValidByte) continue;
      token.push(TOKEN_CHARACTERS.charAt(byte % charsetLength));
      if (token.length === length) break;
    }

  return token.join("");
};
