import type { Session, User } from "better-auth";

export interface GetSessionPayload {
  session: Session;
  user: User;
}
