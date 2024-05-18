import { AttackId } from "@/models/dungeons/attack/AttackId";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";

enum BaseAttackKey {
  "Ice Shard Start" = "Ice Shard Start",
}

export const AttackKey = mergeObjectsStrict(AttackId, BaseAttackKey);
export type AttackKey = AttackId | BaseAttackKey;
