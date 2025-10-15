import type { Session } from "#shared/models/auth/Session";

export interface DeviceId {
  sessionId: Session["session"]["id"];
  userId: Session["user"]["id"];
}
