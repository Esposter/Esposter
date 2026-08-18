import { drizzleAdapterConfiguration } from "@@/server/services/auth/drizzleAdapterConfiguration";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { createMockDb } from "@esposter/db-mock";
import { accounts, sessions, users } from "@esposter/db-schema";
import { betterAuth } from "better-auth";
import { describe, expect, test } from "vitest";

// The adapter derives the relation key it joins on from the schema table key, so the `users` relation `sessions`
// And `accounts` carry is what makes `advanced.database.joins` resolve rather than throw. Renaming either back to
// The singular every other table uses is invisible to typecheck and to every other test
describe("better-auth joins", () => {
  test("reads a session with its user in one query", async () => {
    expect.hasAssertions();

    const db = await createMockDb();
    const auth = betterAuth({
      advanced: { database: { joins: true } },
      database: drizzleAdapter(db, drizzleAdapterConfiguration),
    });
    const createdAt = new Date();
    const userId = crypto.randomUUID();
    const email = "joins@esposter.test";
    await db
      .insert(users)
      .values({ biography: "", createdAt, email, emailVerified: true, id: userId, name: "name", updatedAt: createdAt });
    await db.insert(accounts).values({
      accountId: crypto.randomUUID(),
      createdAt,
      id: crypto.randomUUID(),
      issuer: "local:oauth:github",
      providerId: "github",
      updatedAt: createdAt,
      userId,
    });
    const token = crypto.randomUUID();
    await db.insert(sessions).values({
      createdAt,
      expiresAt: new Date(createdAt.getTime() + 1),
      id: crypto.randomUUID(),
      token,
      updatedAt: createdAt,
      userId,
    });
    const { internalAdapter } = await auth.$context;

    const session = await internalAdapter.findSession(token);

    expect(session?.user.email).toBe(email);
  });
});
