import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";

import { attackIdSchema } from "#shared/models/dungeons/attack/AttackId";
import { soundEffectKeySchema } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { z } from "zod";

export interface Attack {
  id: AttackId;
  power: number;
  soundEffectKey: SoundEffectKey;
}

export const attackSchema = z.object({
  id: attackIdSchema,
  power: z.int().positive(),
  soundEffectKey: soundEffectKeySchema,
}) satisfies z.ZodType<Attack>;
