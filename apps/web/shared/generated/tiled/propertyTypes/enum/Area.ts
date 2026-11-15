export const Area = {
  Grass: "Grass",
} as const;
export type Area = (typeof Area)[keyof typeof Area];
