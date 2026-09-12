import type { Context } from "@@/server/trpc/context";
import type { User } from "@esposter/db-schema";

// Better-auth's own `listSessions` sits behind its freshness middleware, which rejects a session older than
// `freshAge` — a day by default — so a reader who signed in yesterday could neither see their sessions nor revoke
// One. The rows are ours, so reading them is a plain query and only the writes go through better-auth, whose
// Revoke endpoints ask for a valid session rather than a fresh one
export const readActiveSessions = (db: Context["db"], userId: User["id"]) =>
  db.query.sessions.findMany({
    // Expired rows are not sessions anyone is signed in with — better-auth's own listing filters them the same way
    where: { expiresAt: { gt: new Date() }, userId: { eq: userId } },
  });
