import type { SnapshotChannelDefinition } from "#shared/models/resource/SnapshotChannelDefinition";
import type { SnapshotChannel } from "@esposter/db-schema";

import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";

// The oldest a version of the channel may be and still be one. Every read of a version compares against it, so a
// Version past its channel's age is gone the moment it expires, on a resource nobody edits as on any other, with no
// Sweep to run: the next revision taken deletes its row and collects its bytes. A channel with no age limit answers
// The epoch, which every version is newer than
export const getSnapshotRetainedSince = (channel: SnapshotChannel) => {
  const { maxAgeMs }: SnapshotChannelDefinition = SnapshotChannelDefinitionMap[channel];
  return new Date(maxAgeMs ? Date.now() - maxAgeMs : 0);
};
