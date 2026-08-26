import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useDungeonsStore } from "@/store/dungeons";
import { jsonDateParse } from "@esposter/shared";

export const useReadDungeons = async () => {
  const { $trpc } = useNuxtApp();
  const dungeonsStore = useDungeonsStore();
  const { setDungeons } = dungeonsStore;
  await useReadData(
    () => {
      // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it. The read is already client-only, inside `useReadData`'s `onMounted` — see the browser-boundary ledger
      const dungeonsJson = window.localStorage.getItem(LocalStorageKey.DungeonsStore);
      setDungeons(dungeonsJson ? new Dungeons(jsonDateParse(dungeonsJson)) : new Dungeons());
    },
    async () => {
      setDungeons(await $trpc.dungeons.readDungeons.query());
    },
  );
};
