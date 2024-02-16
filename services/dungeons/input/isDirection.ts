import { Direction } from "grid-engine";

export const isDirection = (input: string): input is Direction => Object.values(Direction).includes(input as Direction);
