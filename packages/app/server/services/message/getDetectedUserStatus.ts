import type { IUserStatus } from "#shared/db/schema/userStatuses";

import { UserStatus } from "#shared/models/db/user/UserStatus";
import { dayjs } from "#shared/services/dayjs";

export const getDetectedUserStatus = ({ expiresAt, isConnected, status }: IUserStatus): UserStatus =>
  status && (!expiresAt || dayjs(expiresAt).isAfter(Date.now()))
    ? status
    : isConnected
      ? UserStatus.Online
      : UserStatus.Offline;
