import type { Npc } from "@/models/dungeons/scene/world/Npc";

import { createOperationData } from "@/services/shared/createOperationData";

export const useNpcStore = defineStore("dungeons/world/npc", () => {
  const { items, ...restData } = useCursorPaginationData<Npc>();
  return {
    items,
    ...createOperationData(items, ["id"], "Npc"),
    ...restData,
  };
});
