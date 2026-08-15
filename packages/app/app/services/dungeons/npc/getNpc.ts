import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";

import { npcs } from "@/assets/dungeons/data/npcs";
import { getById } from "@/services/dungeons/getById";

export const getNpc = (npcId: NpcId) => getById(npcs, npcId, getNpc.name);
