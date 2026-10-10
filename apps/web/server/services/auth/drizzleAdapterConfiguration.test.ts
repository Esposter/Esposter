import { apiKeyPlugin } from "#server/services/auth/apiKeyPlugin";
import { authModelOptions } from "#server/services/auth/authModelOptions";
import { drizzleAdapterConfiguration } from "#server/services/auth/drizzleAdapterConfiguration";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { createMockDb } from "@esposter/db-mock";
import { accountsInAuth, sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { betterAuth } from "better-auth";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

// The adapter derives the relation key each join reads from the model name: the model itself for a join to one row
// (`usersInAuth`), and the model plus `s` for a join to many (`accountsInAuths`). Each relation better-auth joins on is
// Named that way only for it, so renaming one is invisible to typecheck and to every other test
describe("drizzleAdapterConfiguration", () => {
  const accountId = crypto.randomUUID();
  const email = "email";
  const providerId = "providerId";
  const token = crypto.randomUUID();
  // One user holding one account and one session, behind the options the app joins with
  const createInternalAdapter = async () => {
    const db = await createMockDb();
    const auth = betterAuth({
      ...authModelOptions,
      advanced: { database: { joins: true } },
      database: drizzleAdapter(db, drizzleAdapterConfiguration),
    });
    const createdAt = new Date(0);
    const userId = crypto.randomUUID();
    await db
      .insert(usersInAuth)
      .values({ biography: "", createdAt, email, emailVerified: true, id: userId, name: "name", updatedAt: createdAt });
    await db
      .insert(accountsInAuth)
      .values({ accountId, createdAt, id: crypto.randomUUID(), providerId, updatedAt: createdAt, userId });
    await db
      .insert(sessionsInAuth)
      .values({ createdAt, expiresAt: new Date(1), id: crypto.randomUUID(), token, updatedAt: createdAt, userId });
    const { internalAdapter } = await auth.$context;
    return internalAdapter;
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The adapter registers better-auth's schema check, and the handler runs it inside every transaction — so a
  // Column better-auth stopped writing fails sign-in in the running app while a read like the joins below never
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

    const internalAdapter = await createInternalAdapter();

    const session = await internalAdapter.findSession(token);

    expect(session?.user.email).toBe(email);
  });

  // An OAuth callback looks the provider's account up with the user it signs in
  test("joins an account to its user in one query", async () => {
    expect.hasAssertions();

    const internalAdapter = await createInternalAdapter();

    const accountOwner = await internalAdapter.findAccountOwnerByKey({ accountId, providerId });

    assert(accountOwner?.kind === "owned");
    expect(accountOwner.user.email).toBe(email);
  });

  // An OAuth callback whose account matched no row looks up the user holding the provider's email, with the accounts
  // It could link onto
  test("joins a user to its accounts in one query", async () => {
    expect.hasAssertions();

    const internalAdapter = await createInternalAdapter();

    const userWithAccounts = await internalAdapter.findUserByEmail(email, { includeAccounts: true });

    expect(userWithAccounts?.accounts.map((account) => account.accountId)).toStrictEqual([accountId]);
  });
});
