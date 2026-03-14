import type { Session, User } from "better-auth";

export interface Device {
  sessionId: Session["id"];
  userId: User["id"];
}
