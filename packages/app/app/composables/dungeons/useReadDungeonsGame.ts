import { DungeonsGame } from "#shared/models/dungeons/data/DungeonsGame";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { useDungeonsStore } from "@/store/dungeons";

export const useReadDungeonsGame = async () => {
  const { $trpc } = useNuxtApp();
  const dungeonsStore = useDungeonsStore();
  const { game } = storeToRefs(dungeonsStore);
  await useReadData(
    () => {
      const dungeonsStoreJson = localStorage.getItem(DUNGEONS_LOCAL_STORAGE_KEY);
      if (dungeonsStoreJson) game.value = Object.assign(new DungeonsGame(), jsonDateParse(dungeonsStoreJson));
      else game.value = new DungeonsGame();
    },
    async () => {
      game.value = await $trpc.dungeons.readGame.query();
    },
  );
};
