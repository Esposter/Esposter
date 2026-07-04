/* eslint-disable vitest/require-top-level-describe */
import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { MOCK_ENDPOINT } from "@/services/constants.test";
import { pushSubscriptionsInMessage, users } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, describe, vi } from "vitest";
// The shared teardown behind every web-push suite: per-test subscription cleanup + mock reset, and user cleanup at
// Suite end. The db is accessed through a getter because each suite's module-level mockDb is assigned in beforeAll.
export const setupWebPushSuite = (
  getMockDb: () => PostgresJsDatabase<typeof relations>,
  userId: string,
): { pushSubscription: { auth: string; endpoint: string; p256dh: string; userId: string } } => {
  afterEach(async () => {
    await getMockDb().delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, userId));
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await getMockDb().delete(users);
  });

  return { pushSubscription: { auth: "", endpoint: MOCK_ENDPOINT, p256dh: "", userId } };
};

describe.todo("setupWebPushSuite");
