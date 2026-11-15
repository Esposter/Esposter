// What a layout check found wrong with a layout
export const FindingKind = {
  DuplicateId: "duplicateId",
  MissingContent: "missingContent",
  UnknownRegion: "unknownRegion",
  UnregisteredContentKey: "unregisteredContentKey",
} as const;
export type FindingKind = (typeof FindingKind)[keyof typeof FindingKind];
