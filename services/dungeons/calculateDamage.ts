import { randomNumber } from "@/services/math/randomNumber";

export const calculateDamage = (attack: number, armor: number) =>
  Math.ceil(randomNumber(0.85, 1.01) * Math.min(attack - armor, 0));
