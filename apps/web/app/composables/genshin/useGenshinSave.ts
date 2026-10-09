import type { GenshinSave } from "genshin-world/save";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { authClient } from "@/services/auth/authClient";
import { AUTOSAVE_INTERVAL_MS } from "@/services/clicker/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { checkIsTRPCConflict } from "@/services/trpc/checkIsTRPCConflict";
import { checkIsServer, getResult, noop } from "@esposter/shared";
import { EMPTY_GENSHIN_SAVE, genshinSaveSchema, mergeGenshinSave } from "genshin-world/save";

// The save the Genshin page plays, loaded before the world is made. Signed in, it is the account's blob under the lease
// the start took; signed out, it is this browser's copy. A change is saved on the clock's autosave cadence, at once after
// a grant, and when the page is hidden. The server's clock is kept as an offset, which the world reads its timers by
export const useGenshinSave = async () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const saveToLocalStorage = useSaveToLocalStorage();
  const session = authClient.useSession();
  const initialSave = shallowRef<GenshinSave>(EMPTY_GENSHIN_SAVE);
  const isReplaced = ref(false);
  const serverClockOffsetMs = ref(0);
  // The lease this page holds, empty while the page plays the browser's save, and the save the page holds with the JSON
  // the account or the browser last stored, so an unchanged save is never sent again
  let sessionId = "";
  let latestSave: GenshinSave = EMPTY_GENSHIN_SAVE;
  let persistedJson = "";
  // Nothing is saved until a reader has loaded the save, so a timer firing first cannot write an empty one over the player's
  let isLoaded = false;

  // The server's now is read between the call's send and its answer, so the offset is taken from their midpoint
  const setServerClockOffset = (serverNow: string, sentAt: number, receivedAt: number) => {
    serverClockOffsetMs.value = Math.round(
      Temporal.Instant.from(serverNow).epochMilliseconds - (sentAt + receivedAt) / 2,
    );
  };
  // A browser that blocks its storage throws on the access, which is logged and read as no guest save, so a signed-in
  // Player's account save still loads
  const readGuestSave = (): GenshinSave | undefined => {
    const guestJson = getResult(
      // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it. The read is already client-only, inside `useReadData`'s `onMounted`
      () => window.localStorage.getItem(LocalStorageKey.GenshinSave),
    )
      .orTee(console.error)
      .unwrapOr(null);
    if (!guestJson) return undefined;

    const parsedJson: unknown = getResult(() => JSON.parse(guestJson))
      .orTee(console.error)
      .unwrapOr(undefined);
    const result = genshinSaveSchema.safeParse(parsedJson);
    return result.success ? result.data : undefined;
  };
  const clearGuestSave = () => {
    getResult(
      // eslint-disable-next-line no-restricted-syntax -- the offline save system's writer half, kept beside the reader above
      () => window.localStorage.removeItem(LocalStorageKey.GenshinSave),
    ).match(noop, console.error);
  };
  const startLease = async () => {
    const sentAt = Date.now();
    const outcome = await executeMutation(() => $trpc.genshin.startGenshin.mutate(), { key: "startGenshin" });
    if (outcome.status === MutationStatus.Failed) console.error(outcome.error);
    if (outcome.status !== MutationStatus.Succeeded) return undefined;

    setServerClockOffset(outcome.result.serverNow, sentAt, Date.now());
    sessionId = outcome.result.sessionId;
    return outcome.result;
  };
  const persist = async () => {
    const save = latestSave;
    const saveJson = JSON.stringify(save);
    if (!isLoaded || saveJson === persistedJson || isReplaced.value) return;
    if (!sessionId) {
      if (saveToLocalStorage(LocalStorageKey.GenshinSave, genshinSaveSchema, save)) persistedJson = saveJson;
      return;
    }

    const currentSessionId = sessionId;
    const sentAt = Date.now();
    const outcome = await executeMutation(
      () => $trpc.genshin.saveGenshin.mutate({ save, sessionId: currentSessionId }),
      { key: "saveGenshin" },
    );
    if (outcome.status === MutationStatus.Succeeded) {
      persistedJson = saveJson;
      setServerClockOffset(outcome.result.serverNow, sentAt, Date.now());
    } else if (outcome.status === MutationStatus.Failed) {
      // A write the server refuses as another session's is the lease lost, so the page is replaced. Any other failure
      // stays unsaved and is sent again by the next save
      if (checkIsTRPCConflict(outcome.error)) isReplaced.value = true;
      else console.error(outcome.error);
    }
  };
  // Signed out, the page plays the browser's save. Signed in, the account's save is loaded, and a guest save the browser
  // holds is uploaded when the account has none, or merged into the account's when it has one
  const readLocalSave = () => {
    initialSave.value = readGuestSave() ?? EMPTY_GENSHIN_SAVE;
    latestSave = initialSave.value;
    persistedJson = JSON.stringify(latestSave);
    isLoaded = true;
  };
  const readAccountSave = async () => {
    if (checkIsServer()) return;

    const guestSave = readGuestSave();
    const start = await startLease();
    if (!start) {
      readLocalSave();
      return;
    }

    const loadedSave = guestSave ? (start.isNew ? guestSave : mergeGenshinSave(start.save, guestSave)) : start.save;
    initialSave.value = loadedSave;
    latestSave = loadedSave;
    persistedJson = JSON.stringify(start.save);
    isLoaded = true;
    await persist();
    if (guestSave && JSON.stringify(latestSave) === persistedJson) clearGuestSave();
  };
  if (!checkIsServer()) {
    // A session another sign-in replaced hears it through the real-time layer, the replacing session's id reaching every
    // subscriber of the user. One that does not hear it is refused by its next save instead
    useOnlineSubscribable(
      () => session.value?.user.id,
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
    // oxlint-disable-next-line typescript/no-floating-promises -- persist settles every failure itself, so the promise it returns cannot reject and nothing waits on it
    useIntervalFn(persist, AUTOSAVE_INTERVAL_MS);
    useEventListener(
      () => document,
      "visibilitychange",
      () => {
        if (document.visibilityState !== "hidden") return;
        // oxlint-disable-next-line typescript/no-floating-promises -- persist settles every failure itself, so the promise it returns cannot reject and nothing waits on it
        persist();
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

  return { initialSave, isReplaced, onWorldGrant: persist, onWorldSave, serverClockOffsetMs, takeBack };
};
