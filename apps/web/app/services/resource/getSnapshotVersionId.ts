import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { ID_SEPARATOR } from "@esposter/shared";

// A row's identity in a list that holds both channels, which a version alone cannot be: the two number
// Independently, so `v1` names one snapshot per channel and a dialog keyed by the number alone restores
// Whichever of them the map happened to keep
export const getSnapshotVersionId = ({ channel, version }: Pick<SnapshotVersion, "channel" | "version">): string =>
  `${channel}${ID_SEPARATOR}${version}`;
