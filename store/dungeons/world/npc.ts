import { type Npc } from "@/models/dungeons/world/Npc";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";

export const useNpcStore = defineStore("dungeons/world/npc", () => {
  const { itemList, ...restData } = createCursorPaginationData<Npc>();
  return {
    ...createOperationData(itemList, "Npc"),
    ...restData,
  };
});
