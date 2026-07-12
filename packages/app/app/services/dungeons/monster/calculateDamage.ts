import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";

// The saturating power / (power + defense) factor lets defense meaningfully reduce damage without ever granting immunity
export const calculateDamage = (attack: number, power: number, defense: number) =>
  Math.ceil(createRandomNumber(1.01, 0.85) * attack * (power / (power + defense)));
