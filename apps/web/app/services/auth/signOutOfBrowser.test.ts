import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MessageInMessage } from "@esposter/db-schema";

import { signOut } from "@/services/auth/authClient.test";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { setupIndexedDbSuite } from "@/services/cache/indexedDb/setupIndexedDbSuite.test";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { createUser } from "@/services/message/user/createUser.test";
import { noop, RoutePath, SITE_NAME, takeOne, toRawDeep } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

// Rows an earlier page load left in the database, written straight to IndexedDB so this module never opens it
const writeEarlierPageRows = (message: MessageInMessage) =>
  new Promise<void>((resolve, reject) => {
    const { indexName, keyPath, storeName } = MessageIndexedDbStoreConfiguration;
    const request = indexedDB.open(SITE_NAME.toLowerCase(), 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, { keyPath }).createIndex(indexName, indexName);
    };
    request.onsuccess = () => {
      const { result } = request;
      const transaction = result.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(toRawDeep(message));
      transaction.oncomplete = () => {
        result.close();
        resolve();
      };
      transaction.onerror = () => {
        reject(new Error("The earlier page's rows could not be written"));
      };
    };
    request.onerror = () => {
      reject(new Error("The database could not be opened to write the earlier page's rows"));
    };
  });

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

  test("reloads in place when signing out fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    signOut.mockRejectedValue(new Error(" "));
    await signOutOfBrowser();

    expect(reloadMock).toHaveBeenCalledExactlyOnceWith();
  });

  // Messages and members are cached per room rather than per reader, so the next reader to open that room offline
  // Would be served the previous reader's rows unless the sign-out clears them
  test("a second user opens a room offline after the first user signs out", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId);
    await writeIndexedDb(MemberIndexedDbStoreConfiguration, [member], message1.roomId);
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    const messages = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);
    const members = await readIndexedDb(MemberIndexedDbStoreConfiguration, message1.roomId);

    expect(messages).toStrictEqual([]);
    expect(members).toStrictEqual([]);
  });

  // A page load that never opened the cache holds no connection to the database, so the sign-out reaches the rows
  // An earlier page load wrote only by deleting the database by name
  test("clears the rows of an earlier page load when this page never opened the cache", async () => {
    expect.hasAssertions();

    await writeEarlierPageRows(message1);
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    await expect(readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId)).resolves.toStrictEqual([]);
  });

  // A failed clear is logged and the sign-out still runs, so the cache cannot hold the reader signed in
  test("signs out and loads anyway when clearing the cache fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId);
    vi.spyOn(indexedDB, "deleteDatabase").mockImplementationOnce(() => {
      throw new Error(" ");
    });
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(signOut).toHaveBeenCalledExactlyOnceWith();
    expect(window.location.href).toBe(RoutePath.Login);
  });

  // The network sign-out goes first and the clear runs last, so a write still queued on the cache cannot reopen the
  // Database during the round trip that signing out takes
  test("clears the cache after signing out", async () => {
    expect.hasAssertions();

    const deleteDatabase = vi.spyOn(indexedDB, "deleteDatabase");
    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(takeOne(deleteDatabase.mock.invocationCallOrder)).toBeGreaterThan(takeOne(signOut.mock.invocationCallOrder));
  });
});
