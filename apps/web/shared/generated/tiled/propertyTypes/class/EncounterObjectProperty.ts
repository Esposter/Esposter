export const EncounterObjectProperty = {
  Area: "area",
} as const;
export type EncounterObjectProperty = (typeof EncounterObjectProperty)[keyof typeof EncounterObjectProperty];
