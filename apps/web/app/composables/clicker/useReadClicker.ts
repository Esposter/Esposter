import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { toClicker } from "@/services/clicker/save/toClicker";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { parseJsonWithSchema } from "@/services/shared/parseJsonWithSchema";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { checkIsDeepEqual, omitDeep } from "@esposter/shared";

export const useReadClicker = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveClicker, setClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  const offlineProgressStore = useOfflineProgressStore();
  const { applyOfflineProgress } = offlineProgressStore;
  // The save watcher's subject: everything the user changes by hand. pointCount and producedValue move on every
  // Tick and updatedAt is stamped by the save itself, so watching them would retrigger the save
  const virtualClicker = computed((oldVirtualClicker) => {
    const newVirtualClicker = omitDeep(clicker.value, "pointCount", "producedValue", "updatedAt");
    return oldVirtualClicker && checkIsDeepEqual(newVirtualClicker, oldVirtualClicker)
      ? oldVirtualClicker
      : newVirtualClicker;
  });
  // Until a read has put the game in place the store holds a new game, and saving that would overwrite the save the
  // Read did not reach, so a change before then is not saved. Each reader clears the flag before it starts, so a
  // Signed-in read that fails after a guest's read does not leave the guest's flag set
  let isRead = false;
  watch(virtualClicker, async () => {
    if (isRead) await saveClicker();
  });

  await useReadData(
    async () => {
      isRead = false;
      // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it — see openspec/specs/architecture/browser-execution/design.md
      const clickerJson = window.localStorage.getItem(LocalStorageKey.ClickerStore);
      // A guest's save lives only in this browser, so one that no longer parses starts a fresh game
      const savedClicker = clickerJson ? parseJsonWithSchema(clickerJson, clickerSaveSchema) : undefined;
      setClicker(savedClicker ? toClicker(savedClicker) : new Clicker());
      isRead = true;
      await applyOfflineProgress();
    },
    async () => {
      isRead = false;
      // The server parsed the save before answering it, and a read that fails throws, which leaves the page unopened
      const { data, etag } = await $trpc.clicker.readClicker.query();
      setClicker(toClicker(data), etag);
      isRead = true;
      await applyOfflineProgress();
    },
  );
};
