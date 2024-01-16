import { generateRandomNumber } from "@/util/math/random/generateNumber";

export const calculateDamage = (attack: number) => generateRandomNumber(0.85, 1.01) * attack;
