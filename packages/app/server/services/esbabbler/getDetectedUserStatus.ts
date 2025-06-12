import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { Session } from "@@/server/models/auth/Session";

import { UserStatus } from "#shared/models/db/user/UserStatus";
import { dayjs } from "#shared/services/dayjs";

export const getDetectedUserStatus = (
  status: IUserStatus["status"],
  statusExpiresAt: IUserStatus["expiresAt"],
  sessionExpiresAt: null | Session["session"]["expiresAt"],
): UserStatus =>
  sessionExpiresAt
    ? status && (!statusExpiresAt || dayjs(statusExpiresAt).isAfter(Date.now()))
      ? status
      : // Auto detect the user status based on the session expire date
        dayjs(sessionExpiresAt).isAfter(Date.now())
        ? UserStatus.Online
        : UserStatus.Offline
    : UserStatus.Offline;
