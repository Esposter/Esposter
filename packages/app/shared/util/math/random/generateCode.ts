import { generateRandomInteger } from "@/shared/util/math/random/generateRandomInteger";

export const generateCode = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = generateRandomInteger(characters.length);
    code += characters.charAt(index);
  }

  return code;
};
