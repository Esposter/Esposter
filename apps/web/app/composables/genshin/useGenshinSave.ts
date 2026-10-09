import type { GenshinSave } from "genshin-world/save";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { authClient } from "@/services/auth/authClient";
import { AUTOSAVE_INTERVAL_MS } from "@/services/clicker/constants";
import { getGenshinStartRetryDelayMs } from "@/services/genshin/getGenshinStartRetryDelayMs";
import { parseGenshinJournal } from "@/services/genshin/parseGenshinJournal";
import { readGuestSave } from "@/services/genshin/readGuestSave";
import { createSingleFlight } from "@/services/shared/createSingleFlight";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { checkIsTRPCConflict } from "@/services/trpc/checkIsTRPCConflict";
import { useAlertStore } from "@/store/alert";
import { checkIsServer, getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { StorageSerializers } from "@vueuse/core";
import { EMPTY_GENSHIN_SAVE, genshinSaveSchema, mergeGenshinSave } from "genshin-world/save";
import { z } from "zod";

const clearGuestSave = () => {
  getResult(
    // eslint-disable-next-line no-restricted-syntax -- the offline save system's writer half, kept beside the reader above
    () => window.localStorage.removeItem(LocalStorageKey.GenshinSave),
  ).match(noop, console.error);
};
// The save the Genshin page plays, loaded before the world is made. Signed in, it is the account's blob under the lease
// The start took, and the page waits on its loading screen until that start takes; signed out, it is this browser's copy.
// A change is saved on the clock's autosave cadence, at once after a grant, and when the page is left. The server's clock
// Is kept as an offset, which the world reads its timers by
export const useGenshinSave = async () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const saveToLocalStorage = useSaveToLocalStorage();
  const session = authClient.useSession();
  const initialSave = shallowRef<GenshinSave>(EMPTY_GENSHIN_SAVE);
  const isReplaced = ref(false);
  const isSaveLoaded = ref(false);
  const isStartRetrying = ref(false);
  const serverClockOffsetMs = ref(0);
  // The account whose journal the page keeps, empty until its save is read, and the journal under it. The journal holds
  // The save the account has not acknowledged, so a page left mid-save leaves it for the next start to adopt
  const journalUserId = ref("");
  const journalJson = useLocalStorage<null | string>(() => LocalStorageKey.GenshinPending(journalUserId.value), null, {
    flush: "sync",
    listenToStorageChanges: false,
    serializer: StorageSerializers.string,
  });
  // The lease this page holds, empty while the page plays the browser's save, and the ETag of the blob as the last start
  // Or save acknowledged it, which the next save is conditioned on
  let sessionId = "";
  let etag: string | undefined;
  // The save the page holds, and the JSON of the save the account or the browser last stored, so an unchanged save is
  // Never sent again
  let latestSave: GenshinSave = EMPTY_GENSHIN_SAVE;
  let persistedJson = "";
  // Resolves the wait between two start attempts early, when the page's retry asks for it, and set once the page is left,
  // So a start still being retried never takes the lease for a page nobody is on
  let retryStartNow: (() => void) | undefined;
  let isLeft = false;

  // The server's now is read between the call's send and its answer, so the offset is taken from their midpoint
  const setServerClockOffset = (serverNow: string, sentAt: number, receivedAt: number) => {
    serverClockOffsetMs.value = Math.round(
      Temporal.Instant.from(serverNow).epochMilliseconds - (sentAt + receivedAt) / 2,
    );
  };
  const startLease = async () => {
    const sentAt = Date.now();
    const outcome = await executeMutation(() => $trpc.genshin.startGenshin.mutate(), { key: "startGenshin" });
    if (outcome.status === MutationStatus.Failed) console.error(outcome.error);
    if (outcome.status !== MutationStatus.Succeeded) return undefined;

    setServerClockOffset(outcome.result.serverNow, sentAt, Date.now());
    sessionId = outcome.result.sessionId;
    etag = outcome.result.etag;
    return outcome.result;
  };
  // A start that fails is retried with backoff until it takes, the page's loading screen held meanwhile, and the wait is
  // Cut short by the page's retry. No copy of the browser's save stands in for the account's while it waits
  const waitForStartRetry = (delayMs: number) => {
    const { promise, resolve } = Promise.withResolvers<void>();
    retryStartNow = () => {
      resolve();
    };
    window.setTimeout(() => {
      resolve();
    }, delayMs);
    return promise;
  };
  const startUntilStarted = async (
    attempt: number,
  ): Promise<NonNullable<Awaited<ReturnType<typeof startLease>>> | undefined> => {
    if (isLeft) return undefined;

    const start = await startLease();
    if (start) {
      isStartRetrying.value = false;
      return start;
    }

    isStartRetrying.value = true;
    await waitForStartRetry(getGenshinStartRetryDelayMs(attempt));
    return startUntilStarted(attempt + 1);
  };
  const retryStart = () => {
    retryStartNow?.();
  };
  // The journal holds the save the account has not acknowledged, and is cleared once it has. A page can be closed the
  // Moment it is hidden, so the journal is written at once rather than sent, and the next start adopts it only when it
  // Replaced the session that wrote it
  const syncJournal = () => {
    if (!journalUserId.value || !sessionId || !isSaveLoaded.value || isReplaced.value) return;

    if (JSON.stringify(latestSave) === persistedJson) journalJson.value = null;
    else journalJson.value = JSON.stringify({ save: latestSave, sessionId });
  };
  // One save at a time: a save requested while one is in flight is sent once after it settles, carrying the newest save
  // And the ETag that save acknowledged, so the page never sends a save over one it has not heard back about
  const sendSave = async () => {
    const save = latestSave;
    const saveJson = JSON.stringify(save);
    if (!isSaveLoaded.value || saveJson === persistedJson || isReplaced.value) return;
    if (!sessionId) {
      if (saveToLocalStorage(LocalStorageKey.GenshinSave, genshinSaveSchema, save)) persistedJson = saveJson;
      return;
    }
    // A save the schema refuses is not sent and is never marked saved: it is logged and shown, and is sent again only
    // Once it changes
    const parsedResult = genshinSaveSchema.safeParse(save);
    if (!parsedResult.success) {
      console.error(parsedResult.error);
      createAlert(z.prettifyError(parsedResult.error), "error");
      return;
    }
    if (etag === undefined) {
      const missingEtagError = new InvalidOperationError(
        Operation.Update,
        "genshin save",
        "the blob was acknowledged without an ETag",
      );
      console.error(missingEtagError);
      return;
    }

    const currentEtag = etag;
    const currentSessionId = sessionId;
    const sentAt = Date.now();
    const outcome = await executeMutation(
      () =>
        $trpc.genshin.saveGenshin.mutate({ etag: currentEtag, save: parsedResult.data, sessionId: currentSessionId }),
      { key: "saveGenshin" },
    );
    if (outcome.status === MutationStatus.Succeeded) {
      persistedJson = saveJson;
      etag = outcome.result.etag;
      setServerClockOffset(outcome.result.serverNow, sentAt, Date.now());
    }
    // A write the server refuses as another session's is the lease lost, so the page is replaced. Any other failure
    // Stays unsaved and is sent again by the next save
    else if (outcome.status === MutationStatus.Failed && checkIsTRPCConflict(outcome.error)) isReplaced.value = true;
    else if (outcome.status === MutationStatus.Failed) console.error(outcome.error);
    syncJournal();
  };
  const persist = createSingleFlight(sendSave);
  // Signed out, the page plays the browser's save. Signed in, the account's save is loaded, and a guest save the browser
  // Holds is uploaded when the account has none, or merged into the account's when it has one
  const readLocalSave = () => {
    initialSave.value = readGuestSave() ?? EMPTY_GENSHIN_SAVE;
    latestSave = initialSave.value;
    persistedJson = JSON.stringify(latestSave);
    isSaveLoaded.value = true;
  };
  const loadAccountSave = async () => {
    const guestSave = readGuestSave();
    const start = await startUntilStarted(0);
    if (!start) return;

    // The journal is adopted only by the start that replaced the session which wrote it, since only then is the save it
    // Holds the one the account would have kept. Any other journal is out of date, so it is discarded
    const journal = parseGenshinJournal(journalJson.value);
    const adoptedJournal = journal && journal.sessionId === start.previousSessionId ? journal : undefined;
    if (journal && !adoptedJournal) journalJson.value = null;

    const baseSave = adoptedJournal?.save ?? start.save;
    const loadedSave = guestSave ? (start.isNew ? guestSave : mergeGenshinSave(baseSave, guestSave)) : baseSave;
    initialSave.value = loadedSave;
    latestSave = loadedSave;
    persistedJson = JSON.stringify(start.save);
    isSaveLoaded.value = true;
    await persist();
    syncJournal();
    if (guestSave && JSON.stringify(latestSave) === persistedJson) clearGuestSave();
  };
  // The account's save loads in the background, so the page is not held in setup while a start is retried. Its loading
  // Screen waits on isSaveLoaded, and a failed start on isStartRetrying
  const readAccountSave = () => {
    const accountUserId = session.value.data?.user.id;
    if (checkIsServer() || !accountUserId || journalUserId.value) return;

    journalUserId.value = accountUserId;
    // oxlint-disable-next-line typescript/no-floating-promises -- loadAccountSave retries until the save loads and settles every failure itself, so the promise it returns cannot reject and nothing waits on it
    loadAccountSave();
  };
  if (!checkIsServer()) {
    // A session another sign-in replaced hears it through the real-time layer, the replacing session's id reaching every
    // Subscriber of the user. One that does not hear it is refused by its next save instead
    useOnlineSubscribable(
      () => session.value.data?.user.id,
      (userId) => {
        if (!userId) return undefined;
        const sessionReplacedUnsubscribable = $trpc.genshin.onSessionReplaced.subscribe(undefined, {
          onData: (replacedSessionId) => {
            if (sessionId && replacedSessionId !== sessionId) isReplaced.value = true;
          },
        });
        return () => {
          sessionReplacedUnsubscribable.unsubscribe();
        };
      },
      getOnlineSubscribableContext(),
    );
    // Leaving the page, in the app or out of it, writes the journal at once and sends the save. The journal is what
    // Survives a page closed before the send lands
    const leave = () => {
      syncJournal();
      // oxlint-disable-next-line typescript/no-floating-promises -- persist settles every failure itself, so the promise it returns cannot reject and nothing waits on it
      persist();
    };
    onScopeDispose(() => {
      isLeft = true;
      retryStart();
      leave();
    });
    // oxlint-disable-next-line typescript/no-floating-promises -- persist settles every failure itself, so the promise it returns cannot reject and nothing waits on it
    useIntervalFn(persist, AUTOSAVE_INTERVAL_MS);
    useEventListener(
      () => window.document,
      "visibilitychange",
      () => {
        if (window.document.visibilityState === "hidden") leave();
      },
    );
    useEventListener(
      () => window,
      "pagehide",
      () => {
        leave();
      },
    );
  }

  await useReadData(readLocalSave, readAccountSave);

  // The world's save is its whole state, kept as the latest for the next save to send
  const onWorldSave = (save: GenshinSave) => {
    latestSave = save;
  };
  // The game is taken back by a new start, and the page reloads to resume the save that start holds
  const takeBack = async () => {
    const outcome = await executeMutation(() => $trpc.genshin.startGenshin.mutate(), { key: "startGenshin" });
    if (outcome.status === MutationStatus.Succeeded) window.location.reload();
    else if (outcome.status === MutationStatus.Failed) console.error(outcome.error);
  };

  return {
    initialSave,
    isReplaced,
    isSaveLoaded,
    isStartRetrying,
    onWorldGrant: persist,
    onWorldSave,
    retryStart,
    serverClockOffsetMs,
    takeBack,
  };
};
