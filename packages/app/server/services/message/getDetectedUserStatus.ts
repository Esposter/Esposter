import type { IUserStatus } from "@esposter/db";

import { dayjs } from "#shared/services/dayjs";
import { UserStatus } from "@esposter/db";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: IUserStatus): UserStatus =>
  status && (!expiresAt || dayjs(expiresAt).isAfter(Date.now()))
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
