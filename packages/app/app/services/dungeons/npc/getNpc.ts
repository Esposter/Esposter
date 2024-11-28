import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";

import { npcs } from "@/assets/dungeons/data/npcs";
import { NotFoundError } from "@esposter/shared";

export const getNpc = (npcId: NpcId) => {
  const npc = npcs.find((a) => a.id === npcId);
  if (!npc) throw new NotFoundError(getNpc.name, npcId);
  return npc;
};
