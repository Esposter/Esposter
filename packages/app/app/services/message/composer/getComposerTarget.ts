import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";

// The inverse of getComposerKey, for the surfaces that read composer state back out of storage rather than
// Write it — the drafts page above all, which is handed keys and has to say which room and which thread each
// One belongs to. Split on the first separator only: a room id never contains one, and a thread root rowKey is
// A reverse-ticked timestamp, so the first is always the boundary
export const getComposerTarget = (composerKey: string): ComposerTarget => {
  const separatorIndex = composerKey.indexOf(COMPOSITE_KEY_SEPARATOR);
  return separatorIndex === -1
    ? { roomId: composerKey, threadRootRowKey: "" }
    : { roomId: composerKey.slice(0, separatorIndex), threadRootRowKey: composerKey.slice(separatorIndex + 1) };
};
