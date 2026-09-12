import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { getDetectedUserStatus } from "@@/server/services/message/getDetectedUserStatus";
import { userEventEmitter } from "@@/server/services/user/events/userEventEmitter";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { DatabaseEntityType, userStatusesInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const upsertConnectedStatus = async (ctx: AuthedContext, isConnected: boolean): Promise<void> => {
  const upsertedStatus = requireMutation(
    (
      await ctx.db
        .insert(userStatusesInMessage)
        .values({ isConnected, userId: ctx.getSessionPayload.user.id })
        .onConflictDoUpdate({ set: { isConnected }, target: userStatusesInMessage.userId })
        .returning()
    )[0],
    Operation.Update,
    DatabaseEntityType.UserStatus,
    JSON.stringify({ isConnected }),
  );

  userEventEmitter.emit("upsertStatus", { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) });
};
