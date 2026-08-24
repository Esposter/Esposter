import type { Database } from "@esposter/db-schema";

import { MOCK_ENDPOINT } from "#src/services/constants.test";
import { dayjs } from "@esposter/db";
import { pushSubscriptionsInMessage, sessions, users } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, describe, vi } from "vitest";
// The shared teardown behind every web-push suite: per-test subscription cleanup + mock reset, and user cleanup at
// Suite end. The db is accessed through a getter because each suite's module-level mockDb is assigned in beforeAll.
// A subscription names the session that created it, so `seedSession` writes that row — called from the suite's own
// `beforeAll` rather than one registered here, because the db it needs does not exist until that hook runs.
export const setupWebPushSuite = (
  getMockDb: () => Database,
  userId: string,
): {
  pushSubscription: { auth: string; endpoint: string; p256dh: string; sessionId: string; userId: string };
  seedSession: () => Promise<void>;
} => {
  const sessionId = `session${ID_SEPARATOR}${userId}`;

  afterEach(async () => {
    await getMockDb().delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, userId));
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await getMockDb().delete(users).where(eq(users.id, userId));
  });

  return {
    pushSubscription: { auth: "", endpoint: MOCK_ENDPOINT, p256dh: "", sessionId, userId },
    seedSession: async () => {
      await getMockDb()
        .insert(sessions)
        .values({ expiresAt: dayjs().add(1, "day").toDate(), id: sessionId, token: sessionId, userId });
    },
  };
};

describe.todo("setupWebPushSuite");
