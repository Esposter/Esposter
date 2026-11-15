import type { RequestEvent } from "nuxt/server";

import { readSession } from "#server/services/auth/readSession";
import { readSocketSession } from "#server/services/auth/readSocketSession";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#server/services/auth/readSession"), () => ({ readSession: vi.fn<typeof readSession>() }));

describe(readSocketSession, () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // A page on another site can open a socket to this app, and the browser sends the session cookie with it
  test("refuses an upgrade another site opened, before it reads the session", async () => {
    expect.hasAssertions();

    await expect(readSocketSession(createEvent("https://attacker.test"))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[HTTPError: HTTPError 403]`,
    );

    expect(readSession).not.toHaveBeenCalled();
  });

  test("reads the session of an upgrade from this app's own origin", async () => {
    expect.hasAssertions();

    const authSession = { session: { id: v7() }, user: { id: v7() } } as Awaited<ReturnType<typeof readSession>>;
    vi.mocked(readSession).mockResolvedValueOnce(authSession);

    await expect(readSocketSession(createEvent(TEST_ORIGIN))).resolves.toBe(authSession);
  });
});

const createEvent = (origin: string) => {
  const url = `${TEST_ORIGIN}/ws/user`;
  return {
    req: new Request(url, { headers: { Origin: origin, Upgrade: "websocket" } }),
    url: new URL(url),
  } as unknown as RequestEvent;
};
