import type { SnapshotKind } from "#shared/models/resource/SnapshotKind";

export interface SnapshotChannelDefinition {
  kind: SnapshotKind;
  // How old a version may be before it is gone, whatever else happens to the resource
  maxAgeMs?: number;
  // How many versions may stand at once, so a resource edited all day keeps a bounded history within its age
  maxRetained?: number;
  title: string;
}
