export const exhaustiveGuard = (value: never) => {
  throw new Error(`Exhaustive guard unexpected value: ${JSON.stringify(value)}`);
};
