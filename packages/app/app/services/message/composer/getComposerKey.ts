import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { ID_SEPARATOR } from "@esposter/shared";

// The key every per-composer map is partitioned by. A room composer keys by its bare room id, so everything
// Written before threads had a composer of their own still reads back under the same key — the drafts restored
// From localStorage above all, which are stored under the room id and nothing else
export const getComposerKey = ({ roomId, threadRootRowKey }: ComposerTarget) =>
  threadRootRowKey ? `${roomId}${ID_SEPARATOR}${threadRootRowKey}` : roomId;
