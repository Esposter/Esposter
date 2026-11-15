export const ProgramStatusDatasetColumnName = {
  AddedAt: "addedAt",
  Participant: "participant",
  Responded: "responded",
} as const;
export type ProgramStatusDatasetColumnName =
  (typeof ProgramStatusDatasetColumnName)[keyof typeof ProgramStatusDatasetColumnName];
