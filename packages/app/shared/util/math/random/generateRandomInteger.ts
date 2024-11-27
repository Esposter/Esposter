import { generateRandomNumber } from "@/shared/util/math/random/generateRandomNumber";

export const generateRandomInteger = (...args: Parameters<typeof generateRandomNumber>) =>
  Math.floor(generateRandomNumber(...args));
