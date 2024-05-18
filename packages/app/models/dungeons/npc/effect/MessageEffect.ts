import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";

export interface MessageEffect {
  type: EffectType.Message;
  messages: string[];
}
