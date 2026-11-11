import type { setCookie } from "nuxt/server";

// The session cookie the route sets for the driven user: the name and attributes better-auth's context gives its own
// Session cookie, and the signed value that cookie carries
export interface DevSessionCookie {
  attributes: NonNullable<Parameters<typeof setCookie>[3]>;
  name: string;
  value: string;
}
