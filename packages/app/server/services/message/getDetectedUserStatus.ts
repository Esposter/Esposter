import type { IUserStatus } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { UserStatus } from "@esposter/db-schema";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: IUserStatus): UserStatus =>
  status && (!expiresAt || dayjs(expiresAt).isAfter(Date.now()))
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
