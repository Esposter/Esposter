import { npcs } from "@/assets/dungeons/data/npcs";
import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import { NotFoundError } from "@esposter/shared/models/error/NotFoundError";

export const getNpc = (npcId: NpcId) => {
  const npc = npcs.find((a) => a.id === npcId);
  if (!npc) throw new NotFoundError(getNpc.name, npcId);
  return npc;
};
