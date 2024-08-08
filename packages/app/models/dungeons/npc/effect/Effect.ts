import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { MessageEffect } from "@/models/dungeons/npc/effect/MessageEffect";

type BaseEffect = MessageEffect;
export type Effect = { type: Exclude<EffectType, BaseEffect["type"]> } | BaseEffect;
