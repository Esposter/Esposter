import type { Npc } from "#src/models/dungeons/scene/world/Npc";

import { createOperationData } from "#src/services/shared/createOperationData";

export const useNpcStore = defineStore("dungeons/world/npc", () => {
  const { items, ...restData } = useCursorPaginationData<Npc>();
  return { items, ...createOperationData(items, ["id"], "Npc"), ...restData };
});
