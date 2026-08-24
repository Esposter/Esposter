import type { Session } from "better-auth";

// What a session row is allowed to say about itself on the account surface. `ipAddress` is deliberately absent:
// It does not help the holder recognise a session, and a shared screenshot would carry the address. Place
// Belongs here the day something in the stack can turn an address into a city — see
// /docs/users/session-device-management
export interface SessionSummary extends Pick<Session, "id" | "updatedAt"> {
  isCurrent: boolean;
  // "" when the request that created the session carried no user agent, which the label reads as an unknown
  // Device rather than as a missing value
  userAgent: string;
}
