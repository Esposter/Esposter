import { attacks } from "@/assets/dungeons/attack/attacks";
import type { AttackId } from "@/models/dungeons/attack/AttackId";

export const getAttack = (attackId: AttackId) => attacks.find((a) => a.id === attackId);
