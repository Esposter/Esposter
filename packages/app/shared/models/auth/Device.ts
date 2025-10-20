import type { Session } from "#shared/models/auth/Session";

export interface Device {
  sessionId: Session["session"]["id"];
  userId: Session["user"]["id"];
}
