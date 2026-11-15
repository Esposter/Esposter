import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { ItemEntityType } from "@esposter/shared";

export interface MessageEffect extends ItemEntityType<typeof EffectType.Message> {
  messages: string[];
}
