import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";

export const requireKnockerCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireCallSession(db, callSessionId);
  if (callKnockerMap.get(callSessionId)?.has(sessionPayload.session.id)) return callSession;

  throw getForbiddenError("Must be waiting to join call");
};
