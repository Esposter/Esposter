import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";
import { ID_SEPARATOR } from "@esposter/shared";

// The inverse of getComposerKey, for the surfaces that read composer state back out of storage rather than
// Write it — the drafts page above all, which is handed keys and has to say which room and which thread each
// One belongs to. Split on the first separator only: a room id never contains one, and a thread root id is a
// Uuid, so the first is always the boundary
export const getComposerTarget = (composerKey: string): ComposerTarget | undefined => {
  const separatorIndex = composerKey.indexOf(ID_SEPARATOR);
  if (separatorIndex === -1) return { roomId: composerKey, threadRootId: "" };
  // The key is read back out of storage, so a thread part that is no uuid names no composer at all — read as
  // The room's, its draft would be sent to the room and its clear would miss the key it is stored under
  const threadRootId = composerKey.slice(separatorIndex + 1);
  return checkIsUuidV4(threadRootId) ? { roomId: composerKey.slice(0, separatorIndex), threadRootId } : undefined;
};
