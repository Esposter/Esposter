import type { UserStatusInMessage } from "#src/schema/message/userStatusesInMessage";

import { UserStatus } from "#src/models/user/UserStatus";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: UserStatusInMessage): UserStatus =>
  status && (!expiresAt || expiresAt.getTime() > Date.now())
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
