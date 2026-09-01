import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";

// What a version is called wherever one is named — the timeline row, the preview banner, the restore
// Confirmation and the notification that follows it. Labelled by its channel rather than by its number alone,
// Because the two channels number independently and `v1` names one snapshot in each
export const getSnapshotVersionTitle = ({ channel, version }: Pick<SnapshotVersion, "channel" | "version">): string =>
  `${SnapshotChannelDefinitionMap[channel].title} v${version}`;
