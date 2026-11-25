import type { SessionCookie } from "#server/models/auth/SessionCookie";

import { readSession } from "#server/services/auth/readSession";
import { auth, db } from "#server/services/devSession/devSessionAuth.test";
import { HYDRATION_CHECK_USER_ID } from "#server/services/hydrationCheck/constants";
import { openHydrationCheckSession } from "#server/services/hydrationCheck/openHydrationCheckSession";
import { MOCK_ENVIRONMENT_VARIABLES } from "#shared/services/environment/constants.test";
import { sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("#server/auth"), () => import("#server/services/devSession/devSessionAuth.test"));

const readCookieSession = (cookie: SessionCookie) =>
  readSession(new Headers({ cookie: `${cookie.name}=${encodeURIComponent(cookie.value)}` }));

describe(openHydrationCheckSession, () => {
  const authorization = `Bearer ${MOCK_ENVIRONMENT_VARIABLES.HYDRATION_CHECK_SECRET}`;

  afterEach(async () => {
    await db.delete(usersInAuth);
  });

  test("the secret signs the check's user in, and the next run revokes the session before it", async () => {
    expect.hasAssertions();

    const firstCookie = await openHydrationCheckSession(await auth.$context, authorization);
    const secondCookie = await openHydrationCheckSession(await auth.$context, authorization);

    assert.exists(firstCookie);
    assert.exists(secondCookie);
    await expect(readCookieSession(firstCookie)).resolves.toBeNull();
    expect((await readCookieSession(secondCookie))?.user.id).toBe(HYDRATION_CHECK_USER_ID);
    expect((await db.select().from(usersInAuth)).map(({ id }) => id)).toStrictEqual([HYDRATION_CHECK_USER_ID]);
  });

  test.each([
    ["a wrong secret", `${authorization}x`],
    ["no secret", ""],
  ])("%s is refused", async (_name, value) => {
    expect.hasAssertions();

    const cookie = await openHydrationCheckSession(await auth.$context, value);

    expect(cookie).toBeUndefined();
    await expect(db.select().from(usersInAuth)).resolves.toStrictEqual([]);
    await expect(db.select().from(sessionsInAuth)).resolves.toStrictEqual([]);
  });
});
