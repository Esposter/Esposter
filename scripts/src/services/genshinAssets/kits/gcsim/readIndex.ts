export const readIndex = (text: string, counter: number | undefined): number | undefined => {
  if (text === "c.NormalCounter") return counter;
  return /^\d+$/u.test(text) ? Number(text) : undefined;
};
