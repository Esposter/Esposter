export const pickRandomLength = <T extends string | unknown[]>(values: T) => Math.floor(Math.random() * values.length);
