import { AttackId } from "@/models/dungeons/attack/AttackId";
import { mergeObjectsStrict } from "@esposter/shared";

enum BaseAttackKey {
  "Ice Shard Start" = "Ice Shard Start",
}

export const AttackKey = mergeObjectsStrict(AttackId, BaseAttackKey);
export type AttackKey = AttackId | BaseAttackKey;
