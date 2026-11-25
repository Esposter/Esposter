import type { setCookie } from "nuxt/server";

// A session cookie a route sets for one user: the name and attributes better-auth's context gives its own session
// Cookie, and the signed value that cookie carries
export interface SessionCookie {
  attributes: NonNullable<Parameters<typeof setCookie>[3]>;
  name: string;
  value: string;
}
