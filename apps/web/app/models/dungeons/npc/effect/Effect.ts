import type { BaseEffect } from "#src/models/dungeons/npc/effect/BaseEffect";
import type { EffectType } from "#src/models/dungeons/npc/effect/EffectType";

export type Effect = BaseEffect | { type: Exclude<EffectType, BaseEffect["type"]> };
