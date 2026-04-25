import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";

export const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createCode = (length: number) => {
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = createRandomInteger(CHARACTERS.length);
    code += CHARACTERS.charAt(index);
  }

  return code;
};
