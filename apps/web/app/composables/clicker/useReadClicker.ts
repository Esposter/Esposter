import { createClicker } from "#src/services/clicker/createClicker";
import { clickerLocalSave } from "#src/services/clicker/save/clickerLocalSave";
import { toClicker } from "#src/services/clicker/save/toClicker";
import { parseJsonWithSchema } from "#src/services/shared/parseJsonWithSchema";
import { useClickerStore } from "#src/store/clicker/index";
import { useOfflineProgressStore } from "#src/store/clicker/offlineProgress";
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
  watch(virtualClicker, () => {
    if (isRead) saveClicker();
  });

  await useReadData(
    () => {
      isRead = false;
      // The offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be
      // A second owner of it — see openspec/specs/architecture/browser-execution/design.md
      // oxlint-disable-next-line selector-ban/no-restricted-syntax -- see the comment above
      const clickerJson = window.localStorage.getItem(clickerLocalSave.key);
      // A guest's save lives only in this browser, so one that no longer parses starts a fresh game
      const savedClicker = clickerJson ? parseJsonWithSchema(clickerJson, clickerLocalSave.schema) : undefined;
      setClicker(savedClicker ? toClicker(savedClicker) : createClicker());
      isRead = true;
      applyOfflineProgress();
    },
    async () => {
      isRead = false;
      // The server parsed the save before answering it, and a read that fails throws, which leaves the page unopened
      const { data, etag } = await $trpc.clicker.readClicker.query();
      setClicker(toClicker(data), etag);
      isRead = true;
      applyOfflineProgress();
    },
  );
};
