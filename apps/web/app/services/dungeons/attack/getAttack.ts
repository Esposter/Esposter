import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

import { getById } from "#shared/services/dungeons/getById";
import { attacks } from "@/assets/dungeons/data/attacks";

export const getAttack = (attackId: AttackId) => getById(attacks, attackId, getAttack.name);
