// The address space a stored copy of a resource's content lives in, and its own directory segment under the
// Resource prefix — `{id}/{channel}/{n}.json`. A channel is an address space, not a workflow: what the two
// Share is how a snapshot is addressed, listed, reconstituted and restored, while taking one stays with the
// Caller that knows why it is being taken. See /docs/platform/resource-snapshots
export enum SnapshotChannel {
  Published = "published",
  Revisions = "revisions",
}
