import { SnapshotReason } from "#shared/models/resource/SnapshotReason";

// What a history row says it is. Written from the owner's point of view rather than the mechanism's — they
// Did not ask for a checkpoint, they were about to do something that would have destroyed their draft
export const SnapshotReasonTitleMap = {
  [SnapshotReason.Automatic]: "Autosaved",
  [SnapshotReason.BeforeDeploy]: "Before deploy",
  [SnapshotReason.BeforeImport]: "Before import",
  [SnapshotReason.BeforeRestore]: "Before restore",
  [SnapshotReason.Manual]: "Saved version",
} as const satisfies Record<SnapshotReason, string>;
