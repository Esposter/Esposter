import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";

export interface MessageEffect {
  messages: string[];
  type: EffectType.Message;
}
