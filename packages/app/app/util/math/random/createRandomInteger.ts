import { createRandomNumber } from "@/util/math/random/createRandomNumber";

export const createRandomInteger = (...args: Parameters<typeof createRandomNumber>) =>
  Math.floor(createRandomNumber(...args));
