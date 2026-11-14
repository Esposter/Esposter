import type { Session, User } from "better-auth";

// A signed-in caller as better-auth reads one: the session the request carries and the user it belongs to
export interface AuthSession {
  session: Session;
  user: User;
}
