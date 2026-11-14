import type { UserStatus, UserStatusInMessage } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { getDetectedUserStatus, userStatusesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

// Records whether the person has a socket open, and returns the status the rooms see: the stored one unless it expired
export const upsertConnectedStatus = async (
  userId: string,
  isConnected: boolean,
): Promise<UserStatusInMessage & { status: UserStatus }> => {
  const upsertedStatus = takeOne(
    await db
      .insert(userStatusesInMessage)
      .values({ isConnected, userId })
      .onConflictDoUpdate({ set: { isConnected }, target: userStatusesInMessage.userId })
      .returning(),
  );
  return { ...upsertedStatus, status: getDetectedUserStatus(upsertedStatus) };
};
