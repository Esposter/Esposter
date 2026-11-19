import type { readSession } from "#server/services/auth/readSession";

import { describe } from "vitest";

export const createSessionPayload = () =>
  ({
    session: { expiresAt: new Date(0), id: "session-abcdefghijklmnop" },
    user: { id: "22222222-2222-7222-8222-222222222222" },
  }) as Awaited<ReturnType<typeof readSession>>;

describe.todo("createSessionPayload");
