import type { SnapshotChannelDefinition } from "#shared/models/resource/SnapshotChannelDefinition";

import { SnapshotKind } from "#shared/models/resource/SnapshotKind";
import { SnapshotChannel } from "@esposter/db-schema";

// The one place a channel says what it is. Deliberately small: everything that differs between the two
// Channels beyond these three fields — which counter numbers them, whether an unpublish sweep takes them,
// Whether taking one is an outward act with a public url and a view count — is owned by the caller that takes
// Them, because driving that from a map would be a branch with indirection between it and its reader.
// See openspec/specs/resource/resource-snapshots/design.md
export const SnapshotChannelDefinitionMap = {
  // No cap: publishes are deliberate and rare, and a retired public artifact is something an owner may need
  // To point at, so nothing is pruned
  [SnapshotChannel.Published]: { kind: SnapshotKind.Immutable, title: "Published" },
  // Thirty days, as the free tiers of Figma, Dropbox and Google Drive keep and the least SharePoint recommends, with
  // Google Drive's hundred as the ceiling within them (openspec/specs/resource/resource-snapshots/design.md)
  [SnapshotChannel.Revisions]: {
    kind: SnapshotKind.Reference,
    maxAgeMs: Temporal.Duration.from({ days: 30 }).total("milliseconds"),
    maxRetained: 100,
    title: "Revision",
  },
} as const satisfies Record<SnapshotChannel, SnapshotChannelDefinition>;
