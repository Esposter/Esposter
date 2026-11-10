import type { CookieAttributes } from "better-auth/cookies";

// The session cookie the route sets for the driven user: the name and attributes better-auth's context gives its own
// Session cookie, and the signed value that cookie carries
export interface DevSessionCookie {
  attributes: CookieAttributes;
  name: string;
  value: string;
}
