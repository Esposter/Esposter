import type { BaseEffect } from "@/models/dungeons/npc/effect/BaseEffect";
import type { EffectType } from "@/models/dungeons/npc/effect/EffectType";

export type Effect = BaseEffect | { type: Exclude<EffectType, BaseEffect["type"]> };
