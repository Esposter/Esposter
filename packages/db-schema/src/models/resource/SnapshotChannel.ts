// The address space a stored version of a resource's content lives in. A channel is an address space, not a
// Workflow: what the two share is how a version is recorded, listed, reconstituted and restored, while taking
// One stays with the caller that knows why it is being taken. See openspec/specs/resource/resource-snapshots/design.md
export enum SnapshotChannel {
  Published = "published",
  Revisions = "revisions",
}

export const SnapshotChannels: readonly SnapshotChannel[] = Object.values(SnapshotChannel);
