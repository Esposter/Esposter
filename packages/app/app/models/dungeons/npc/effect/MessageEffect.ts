import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { ItemEntityType } from "@esposter/shared";

export interface MessageEffect extends ItemEntityType<EffectType.Message> {
  messages: string[];
}
