import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { MessageEffect } from "@/models/dungeons/npc/effect/MessageEffect";

export type Effect = BaseEffect | { type: Exclude<EffectType, BaseEffect["type"]> };

type BaseEffect = MessageEffect;
