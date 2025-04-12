import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { Type } from "arktype";

import { attackIdSchema } from "@/models/dungeons/attack/AttackId";
import { soundEffectKeySchema } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { type } from "arktype";

export interface Attack {
  id: AttackId;
  soundEffectKey: SoundEffectKey;
}

export const attackSchema = type({
  id: attackIdSchema,
  soundEffectKey: soundEffectKeySchema,
}) satisfies Type<Attack>;
