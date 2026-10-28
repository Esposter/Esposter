import { toLocalDungeons } from "@/services/dungeons/toLocalDungeons";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useDungeonsStore } from "@/store/dungeons";

export const useReadDungeons = async () => {
  const { $trpc } = useNuxtApp();
  const dungeonsStore = useDungeonsStore();
  const { setDungeons } = dungeonsStore;
  await useReadData(
    () => {
      // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it.
      setDungeons(toLocalDungeons(window.localStorage.getItem(LocalStorageKey.DungeonsStore)));
    },
    async () => {
      const { data, etag } = await $trpc.dungeons.readDungeons.query();
      setDungeons(data, etag);
    },
  );
};
