import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";

export const createRandomInteger = (...args: Parameters<typeof createRandomNumber>) =>
  Math.floor(createRandomNumber(...args));
