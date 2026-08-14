import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";

// The key every per-composer map is partitioned by. A room composer keys by its bare room id, so everything
// Written before threads had a composer of their own still reads back under the same key — the drafts restored
// From localStorage above all, which are stored under the room id and nothing else
export const getComposerKey = ({ roomId, threadRootRowKey }: ComposerTarget) =>
  threadRootRowKey ? `${roomId}${COMPOSITE_KEY_SEPARATOR}${threadRootRowKey}` : roomId;
