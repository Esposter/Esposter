import type { UserStatusInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { UserStatus } from "@esposter/db-schema";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: UserStatusInMessage): UserStatus =>
  status && (!expiresAt || dayjs(expiresAt).isAfter(Date.now()))
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
