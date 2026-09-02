import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotKind } from "#shared/models/resource/SnapshotKind";

// The one place a channel says what it is. Deliberately small: everything that differs between the two
// Channels beyond these three fields — which counter numbers them, whether an unpublish sweep takes them,
// Whether taking one is an outward act with a public url and a view count — is owned by the caller that takes
// Them, because driving that from a map would be a branch with indirection between it and its reader.
// See /docs/platform/resource-snapshots
export const SnapshotChannelDefinitionMap = {
  // No cap: publishes are deliberate and rare, and a retired public artifact is something an owner may need
  // To point at, so nothing is pruned
  [SnapshotChannel.Published]: { kind: SnapshotKind.Immutable, title: "Published" },
  // A ring buffer, so recovery costs a bounded number of blobs and the listing stays bounded with it
  [SnapshotChannel.Revisions]: { kind: SnapshotKind.Reference, maxRetained: 20, title: "Revision" },
} as const satisfies Record<SnapshotChannel, { kind: SnapshotKind; maxRetained?: number; title: string }>;
