import { generateRandomNumber } from "@/util/math/random/generateNumber";

export const calculateDamage = (attack: number) => Math.ceil(generateRandomNumber(0.85, 1.01) * Math.min(attack, 0));
