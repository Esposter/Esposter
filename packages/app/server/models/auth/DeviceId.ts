import type { User } from "#shared/db/schema/users";
import type { Session } from "@@/server/models/auth/Session";

export interface DeviceId {
  sessionId: Session["session"]["id"];
  userId: User["id"];
}
