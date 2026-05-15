import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { ForbiddenError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const requireKnockerCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireCallSession(db, callSessionId);
  if (callKnockerMap.get(callSessionId)?.has(sessionPayload.session.id)) return callSession;

  throw new TRPCError({
    code: "FORBIDDEN",
    message: new ForbiddenError("Must be waiting to join call").message,
  });
};
