import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { useDungeonsStore } from "@/store/dungeons";

export const useReadDungeons = async () => {
  const { $trpc } = useNuxtApp();
  const dungeonsStore = useDungeonsStore();
  const { dungeons } = storeToRefs(dungeonsStore);
  await useReadData(
    () => {
      const dungeonsJson = localStorage.getItem(DUNGEONS_LOCAL_STORAGE_KEY);
      dungeons.value = dungeonsJson ? new Dungeons(jsonDateParse(dungeonsJson)) : new Dungeons();
    },
    async () => {
      dungeons.value = await $trpc.dungeons.readDungeons.query();
    },
  );
};
