import type { Session } from "@@/server/models/auth/Session";

export interface DeviceId {
  sessionId: Session["session"]["id"];
  userId: Session["user"]["id"];
}
