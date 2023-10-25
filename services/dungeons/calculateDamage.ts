import { getRandomNumber } from "@/services/math/getRandomNumber";

export const calculateDamage = (attack: number, armor: number) =>
  Math.ceil(getRandomNumber(0.85, 1.01) * Math.min(attack - armor, 0));
