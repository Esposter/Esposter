import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

import { attacks } from "@/assets/dungeons/data/attacks";
import { getById } from "@/services/dungeons/getById";

export const getAttack = (attackId: AttackId) => getById(attacks, attackId, getAttack.name);
