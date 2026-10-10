// @vitest-environment nuxt
import type { StartGenshinResult } from "#server/services/genshin/startGenshin";
import type { VueWrapper } from "@vue/test-utils";
import type { GenshinSave } from "genshin-world/save";

import { useGenshinSave } from "@/composables/genshin/useGenshinSave";
import { useSession } from "@/services/auth/authClient.test";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { until } from "@vueuse/core";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useGenshinSave, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const etag = "etag";
  const journalSave: GenshinSave = { ...EMPTY_GENSHIN_SAVE, adventureExp: 1 };
  let wrapper: undefined | VueWrapper;
  const startResult = (overrides: Partial<StartGenshinResult> = {}): StartGenshinResult => ({
    etag,
    isNew: true,
    save: EMPTY_GENSHIN_SAVE,
    serverNow: new Date(0).toISOString(),
    sessionId,
    ...overrides,
  });
  const saveResult = () => ({ etag, serverNow: new Date(0).toISOString() });
  // The page is mounted the way Genshin's page is, so its setup is held on the save and its lifecycle is the page's
  const mountGenshinSave = async () => {
    const { promise, resolve } = Promise.withResolvers<Awaited<ReturnType<typeof useGenshinSave>>>();
    wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          resolve(await useGenshinSave());
          return () => h("div");
        },
      }),
    );
    return promise;
  };

  beforeEach(() => {
    // The client's session is still pending, as it is on a direct load, while the server's answer names the account
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: null, isPending: true }),
    );
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    localStorage.clear();
  });

  test("loads a signed-in page's account save while its own session is still pending", async () => {
    expect.hasAssertions();

    trpcMsw.genshin.startGenshin.mutation(() => startResult());
    const genshinSave = await mountGenshinSave();
    await until(genshinSave.isSaveLoaded).toBe(true);

    expect(genshinSave.initialSave.value).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });

  // A start whose response was lost is retried as the same start, so the server answers the attempt it already took
  test("retries a failed start under the page's one session id", async () => {
    expect.hasAssertions();

    const startSessionIds: string[] = [];
    trpcMsw.genshin.startGenshin.mutation(({ input }) => {
      startSessionIds.push(input.sessionId);
      if (startSessionIds.length === 1) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return startResult();
    });
    const genshinSave = await mountGenshinSave();
    await until(genshinSave.isStartRetrying).toBe(true);
    genshinSave.retryStart();
    await until(genshinSave.isSaveLoaded).toBe(true);
    const [firstSessionId, retriedSessionId] = startSessionIds;

    expect(startSessionIds).toHaveLength(2);
    expect(retriedSessionId).toBe(firstSessionId);
  });

  // Another window of the browser can write the journal while this page's start is in flight, and the journal it wrote is
  // The one the start adopts
  test("adopts the journal as the browser holds it when the start answers, not as the page first read it", async () => {
    expect.hasAssertions();

    const previousSessionId = crypto.randomUUID();
    trpcMsw.genshin.startGenshin.mutation(() => {
      localStorage.setItem(
        LocalStorageKey.GenshinPending(userId),
        JSON.stringify({ save: journalSave, sessionId: previousSessionId }),
      );
      return startResult({ isNew: false, previousSessionId });
    });
    const { promise: saveSent, resolve: resolveSaveSent } = Promise.withResolvers<void>();
    trpcMsw.genshin.saveGenshin.mutation(() => {
      resolveSaveSent();
      return saveResult();
    });
    const genshinSave = await mountGenshinSave();
    await until(genshinSave.isSaveLoaded).toBe(true);
    await saveSent;

    expect(genshinSave.initialSave.value).toStrictEqual(journalSave);
  });

  // A save is journaled before it is sent, so a page that dies mid-send leaves the save the account may already hold
  test("journals a save before it is sent", async () => {
    expect.hasAssertions();

    const journalsAtSend: (null | string)[] = [];
    trpcMsw.genshin.startGenshin.mutation(() => startResult());
    trpcMsw.genshin.saveGenshin.mutation(() => {
      journalsAtSend.push(localStorage.getItem(LocalStorageKey.GenshinPending(userId)));
      return saveResult();
    });
    const genshinSave = await mountGenshinSave();
    await until(genshinSave.isSaveLoaded).toBe(true);
    // The load's own save settles after its last microtask, so the page is left to settle before the next save is made
    await flushPromises();
    genshinSave.onWorldSave(journalSave);
    await genshinSave.onWorldGrant();

    expect(journalsAtSend).toStrictEqual([JSON.stringify({ save: journalSave, sessionId })]);
  });
});
