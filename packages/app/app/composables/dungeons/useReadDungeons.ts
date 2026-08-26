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
      const dungeonsJson = window.localStorage.getItem(LocalStorageKey.DungeonsStore);
      setDungeons(dungeonsJson ? new Dungeons(jsonDateParse(dungeonsJson)) : new Dungeons());
    },
    async () => {
      setDungeons(await $trpc.dungeons.readDungeons.query());
    },
  );
};
