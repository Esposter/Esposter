import { AttackId } from "@/models/dungeons/attack/AttackId";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

enum BaseAttackKey {
  IceShardStart = "IceShardStart",
}

export const AttackKey = mergeObjectsStrict(AttackId, BaseAttackKey);
export type AttackKey = AttackId | BaseAttackKey;
