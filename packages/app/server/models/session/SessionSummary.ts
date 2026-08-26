import type { Session } from "better-auth";

// What a session row is allowed to say about itself on the account surface. Two stored values are deliberately
// Absent: `ipAddress`, which does not help the holder recognise a session and would ride along in a shared
// Screenshot, and the raw `userAgent`, which arrives already read as `deviceLabel` — see
// /docs/users/session-device-management
export interface SessionSummary extends Pick<Session, "id" | "updatedAt"> {
  // Reads as an unknown device when the request that created the session carried no user agent, or carried one
  // Nothing recognised
  deviceLabel: string;
  isCurrent: boolean;
}
