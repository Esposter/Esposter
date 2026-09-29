import { apiKeyPlugin } from "@@/server/services/auth/apiKeyPlugin";
import { authModelOptions } from "@@/server/services/auth/authModelOptions";
import { drizzleAdapterConfiguration } from "@@/server/services/auth/drizzleAdapterConfiguration";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { createMockDb } from "@esposter/db-mock";
import { accountsInAuth, sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { betterAuth } from "better-auth";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

// The adapter derives the relation key it joins on from the model name, so the `sessionsInAuth` and `accountsInAuth`
// Relations `usersInAuth` carries are what make `advanced.database.joins` resolve rather than throw. Renaming either to
// The singular every other table uses is invisible to typecheck and to every other test
describe("drizzleAdapterConfiguration", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The adapter registers better-auth's schema check, and the handler runs it inside every transaction — so a
  // Column better-auth stopped writing fails sign-in in the running app while a read like the join below never
  // Opens a transaction and passes. Running the check here is what makes that drift a red suite instead
  test("passes better-auth's schema check", async () => {
    expect.hasAssertions();

    const db = await createMockDb();
    const auth = betterAuth({
      ...authModelOptions,
      database: drizzleAdapter(db, drizzleAdapterConfiguration),
      plugins: [apiKeyPlugin],
    });
    const { checkSchema } = await auth.$context;

    assert.exists(checkSchema);
    await expect(checkSchema()).resolves.toBeUndefined();
  });

  test("joins a session to its user in one query", async () => {
    expect.hasAssertions();

    const db = await createMockDb();
    const auth = betterAuth({
      ...authModelOptions,
      advanced: { database: { joins: true } },
      database: drizzleAdapter(db, drizzleAdapterConfiguration),
    });
    const createdAt = new Date(0);
    const userId = crypto.randomUUID();
    const email = "email";
    await db
      .insert(usersInAuth)
      .values({ biography: "", createdAt, email, emailVerified: true, id: userId, name: "name", updatedAt: createdAt });
    await db
      .insert(accountsInAuth)
      .values({
        accountId: crypto.randomUUID(),
        createdAt,
        id: crypto.randomUUID(),
        providerId: "providerId",
        updatedAt: createdAt,
        userId,
      });
    const token = crypto.randomUUID();
    await db
      .insert(sessionsInAuth)
      .values({ createdAt, expiresAt: new Date(1), id: crypto.randomUUID(), token, updatedAt: createdAt, userId });
    const { internalAdapter } = await auth.$context;

    const session = await internalAdapter.findSession(token);

    expect(session?.user.email).toBe(email);
  });
});
