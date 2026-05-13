export const ID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createId = (length: number): string => {
  const charsetLength = ID_CHARACTERS.length;
  const maxValidByte = 256 - (256 % charsetLength);
  const id: string[] = [];

  while (id.length < length)
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte >= maxValidByte) continue;
      id.push(ID_CHARACTERS.charAt(byte % charsetLength));
      if (id.length === length) break;
    }

  return id.join("");
};
