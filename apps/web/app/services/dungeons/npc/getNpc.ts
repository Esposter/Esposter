import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";

import { getById } from "#shared/services/dungeons/getById";
import { npcs } from "@/assets/dungeons/data/npcs";

export const getNpc = (npcId: NpcId) => getById(npcs, npcId, getNpc.name);
