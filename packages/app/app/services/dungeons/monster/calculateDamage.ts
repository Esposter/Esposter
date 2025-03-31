import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";

export const calculateDamage = (attack: number) => Math.ceil(createRandomNumber(1.01, 0.85) * attack);
