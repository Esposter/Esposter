import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { signOut } from "@/services/auth/authClient.test";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { setupIndexedDbSuite } from "@/services/cache/indexedDb/setupIndexedDbSuite.test";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { createUser } from "@/services/message/user/createUser.test";
import { noop, RoutePath } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(signOutOfBrowser, () => {
  const reloadMock = vi.fn<() => void>();
  const { message1 } = setupIndexedDbSuite();
  const user = createUser();
  const member: MemberInRoom = { ...user, displayName: user.name };

  beforeEach(() => {
    vi.stubGlobal("window", { location: { href: "", reload: reloadMock } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("lands on the given path", async () => {
    expect.hasAssertions();

    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test("reloads in place when given no path", async () => {
    expect.hasAssertions();

    signOut.mockResolvedValue();
    await signOutOfBrowser();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // The session is already gone server-side by the time a caller reaches here, so a cookie clear that fails
  // Must not be what strands the reader on a page still drawn as signed in
  test("loads anyway when signing out fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    signOut.mockRejectedValue(new Error(" "));
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
  });

  // Messages and members are cached per room rather than per reader, so the next reader to open that room offline
  // Would be served the previous reader's rows unless the sign-out clears them
  test("a second user opens a room offline after the first user signs out", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    await writeIndexedDb(MemberIndexedDbStoreConfiguration, [member], message1.partitionKey);
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    const messages = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);
    const members = await readIndexedDb(MemberIndexedDbStoreConfiguration, message1.partitionKey);

    expect(messages).toStrictEqual([]);
    expect(members).toStrictEqual([]);
  });

  // A failed clear is logged and the sign-out still runs, so the cache cannot hold the reader signed in
  test("signs out and loads anyway when clearing the cache fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    vi.spyOn(indexedDB, "deleteDatabase").mockImplementationOnce(() => {
      throw new Error(" ");
    });
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(signOut).toHaveBeenCalledExactlyOnceWith();
    expect(window.location.href).toBe(RoutePath.Login);
  });
});
