import type { SnapshotKind } from "#shared/models/resource/SnapshotKind";

export interface SnapshotChannelDefinition {
  kind: SnapshotKind;
  maxRetained?: number;
  title: string;
}
