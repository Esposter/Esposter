// Unity's white balance runs from minus to plus a hundred each way
const MAX_BALANCE = 100;

export const clamp = (value: number): number => Math.min(Math.max(value, -MAX_BALANCE), MAX_BALANCE);
