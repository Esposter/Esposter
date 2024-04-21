import { generateRandomNumber } from "@/util/math/random/generateRandomNumber";

export const calculateDamage = (attack: number) => Math.ceil(generateRandomNumber(1.01, 0.85) * attack);
