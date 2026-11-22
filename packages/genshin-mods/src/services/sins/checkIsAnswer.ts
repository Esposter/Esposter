import { checkIsObject } from "../checkIsObject";

// An answer is read for its score alone, so the score is what is checked
export const checkIsAnswer = (value: unknown): boolean => checkIsObject(value) && typeof value.score === "number";
