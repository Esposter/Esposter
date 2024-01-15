import { attacks } from "@/assets/dungeons/attacks/attacks";
import { type AttackId } from "@/models/dungeons/attack/AttackId";

export class AttackStore {
  static getAttack(attackId: AttackId) {
    return attacks.find((a) => a.id === attackId);
  }
}
