import { readSession } from "#server/services/auth/readSession";
import { auth, db } from "#server/services/devSession/devSessionAuth.test";
import { openDevSession } from "#server/services/devSession/openDevSession";
import { Environment } from "#shared/models/environment/Environment";
import { sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { DRIVEN_USER_ID } from "@esposter/shared";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

// Registered over `#server/auth` for this suite alone, so the session the route mints is read back by `readSession` and
// The app's own better-auth instance. The module is the in-memory one the suite's other helpers use
vi.mock(import("#server/auth"), () => import("#server/services/devSession/devSessionAuth.test"));

// The row the seed writes for the driven user, the only one the route signs in
const seedDrivenUser = () => {
  const createdAt = new Date(0);
  return db
    .insert(usersInAuth)
    .values({ createdAt, email: "email", emailVerified: true, id: DRIVEN_USER_ID, name: "name", updatedAt: createdAt });
};

describe(openDevSession, () => {
  // An address on this machine, which the gate accepts
  const LOCAL_BASE_URL = "http://localhost:3000";

  afterEach(async () => {
    await db.delete(usersInAuth);
  });

  test("a dev server mints a signed-in session", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", LOCAL_BASE_URL);
    await seedDrivenUser();

    const cookie = await openDevSession(await auth.$context);

    assert.exists(cookie);
    // A request carries the cookie the way the response's Set-Cookie encodes it, with the value URI-encoded
    const headers = new Headers({ cookie: `${cookie.name}=${encodeURIComponent(cookie.value)}` });
    const readSessionPayload = await readSession(headers);
    expect(readSessionPayload?.user.id).toBe(DRIVEN_USER_ID);
  });

  // The mock environment's address is the test origin, which is not this machine, so the gate refuses it as it stands
  test("a server that is not on this machine is refused", async () => {
    expect.hasAssertions();

    await seedDrivenUser();

    const cookie = await openDevSession(await auth.$context);

    expect(cookie).toBeUndefined();
    const sessionRows = await db.select().from(sessionsInAuth);
    expect(sessionRows).toStrictEqual([]);
  });

  test("a production server refuses the session route", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", LOCAL_BASE_URL);
    vi.stubEnv("APP_ENV", Environment.Production);
    await seedDrivenUser();

    const cookie = await openDevSession(await auth.$context);

    expect(cookie).toBeUndefined();
    const sessionRows = await db.select().from(sessionsInAuth);
    expect(sessionRows).toStrictEqual([]);
  });

  test("a session route with no seeded user is refused", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", LOCAL_BASE_URL);

    const cookie = await openDevSession(await auth.$context);

    expect(cookie).toBeUndefined();
    const sessionRows = await db.select().from(sessionsInAuth);
    expect(sessionRows).toStrictEqual([]);
  });
});
