import { encodeLength } from "#src/services/recreation/animeStudio/encodeLength";

export const encodeString = (text: string): Buffer => {
  const bytes = Buffer.from(text, "utf8");
  return Buffer.concat([Buffer.from(encodeLength(bytes.length)), bytes]);
};
