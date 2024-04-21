import { generateRandomNumber } from "@/util/math/random/generateRandomNumber";

export const generateRandomInteger = (...args: Parameters<typeof generateRandomNumber>) =>
  Math.floor(generateRandomNumber(...args));
