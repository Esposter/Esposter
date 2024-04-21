import { pickRandomLength } from "@/util/math/random/pickRandomLength";

export const generateCode = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = pickRandomLength(characters);
    code += characters.charAt(index);
  }

  return code;
};
