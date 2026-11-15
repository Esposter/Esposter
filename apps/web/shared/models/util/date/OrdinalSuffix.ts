export const OrdinalSuffix = {
  Few: "few",
  Many: "many",
  One: "one",
  Other: "other",
  Two: "two",
  Zero: "zero",
} as const;
export type OrdinalSuffix = (typeof OrdinalSuffix)[keyof typeof OrdinalSuffix];
