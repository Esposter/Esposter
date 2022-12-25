import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and `getServerSession`
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
