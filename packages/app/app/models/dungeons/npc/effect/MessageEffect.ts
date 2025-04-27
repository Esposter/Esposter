import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";

export interface MessageEffect extends ItemEntityType<EffectType.Message> {
  messages: string[];
}
