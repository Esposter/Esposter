import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useAuth`, `getSession` and `getServerSession`
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
