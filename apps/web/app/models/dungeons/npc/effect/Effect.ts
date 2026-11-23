import type { EffectType } from "#src/models/dungeons/npc/effect/EffectType";
import type { MessageEffect } from "#src/models/dungeons/npc/effect/MessageEffect";

export type Effect = { type: Exclude<EffectType, MessageEffect["type"]> } | MessageEffect;
