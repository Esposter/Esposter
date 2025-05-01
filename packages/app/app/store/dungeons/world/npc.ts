import type { Npc } from "@/models/dungeons/scene/world/Npc";

import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";

export const useNpcStore = defineStore("dungeons/world/npc", () => {
  const { items, ...restData } = createCursorPaginationData<Npc>();
  return {
    ...createOperationData(items, ["id"], "Npc"),
    ...restData,
  };
});
