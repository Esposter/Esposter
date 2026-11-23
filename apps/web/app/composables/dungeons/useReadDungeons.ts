import { dungeonsLocalSave } from "#src/services/dungeons/dungeonsLocalSave";
import { toLocalDungeons } from "#src/services/dungeons/toLocalDungeons";
import { useDungeonsStore } from "#src/store/dungeons/index";

export const useReadDungeons = async () => {
  const { $trpc } = useNuxtApp();
  const dungeonsStore = useDungeonsStore();
  const { setDungeons } = dungeonsStore;
  await useReadData(
    () => {
      // oxlint-disable-next-line selector-ban/no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it — see openspec/specs/architecture/browser-execution/design.md
      setDungeons(toLocalDungeons(window.localStorage.getItem(dungeonsLocalSave.key)));
    },
    async () => {
      const { data, etag } = await $trpc.dungeons.readDungeons.query();
      setDungeons(data, etag);
    },
  );
};
