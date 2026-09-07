import { createRandomNumber } from "@/util/math/random/createRandomNumber";

// The saturating power / (power + defense) factor lets defense meaningfully reduce damage without ever granting immunity
export const getDamage = (attack: number, power: number, defense: number) => {
  // Guard the 0 / 0 = NaN case — no power means no damage
  if (power === 0) return 0;
  return Math.ceil(createRandomNumber(1.01, 0.85) * attack * (power / (power + defense)));
};
