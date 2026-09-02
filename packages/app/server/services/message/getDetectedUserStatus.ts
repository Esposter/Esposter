import type { UserStatusInMessage } from "@esposter/db-schema";

import { UserStatus } from "@esposter/db-schema";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: UserStatusInMessage): UserStatus =>
  status && (!expiresAt || expiresAt.getTime() > Date.now())
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
