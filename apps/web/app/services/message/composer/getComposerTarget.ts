import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { reverseTickedTimestampSchema } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";

// The inverse of getComposerKey, for the surfaces that read composer state back out of storage rather than
// Write it — the drafts page above all, which is handed keys and has to say which room and which thread each
// One belongs to. Split on the first separator only: a room id never contains one, and a thread root rowKey is
// A reverse-ticked timestamp, so the first is always the boundary
export const getComposerTarget = (composerKey: string): ComposerTarget => {
  const separatorIndex = composerKey.indexOf(ID_SEPARATOR);
  if (separatorIndex === -1) return { roomId: composerKey, threadRootRowKey: "" };
  // The key is read back out of storage, so a thread part that is no rowKey names no thread
  const { data: threadRootRowKey = "" } = reverseTickedTimestampSchema.safeParse(composerKey.slice(separatorIndex + 1));
  return { roomId: composerKey.slice(0, separatorIndex), threadRootRowKey };
};
