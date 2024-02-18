import { type Npc } from "@/models/dungeons/world/Npc";
import { createOperationData } from "@/services/shared/pagination/createOperationData";

export const useNpcStore = defineStore("dungeons/world/npc", () => {
  const itemList = ref<Npc[]>([]);
  return {
    ...createOperationData(itemList, "Npc"),
  };
});
