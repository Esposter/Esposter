import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";

export const createCode = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = createRandomInteger(characters.length);
    code += characters.charAt(index);
  }

  return code;
};
