import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";

import { attackIdSchema } from "#shared/models/dungeons/attack/AttackId";
import { soundEffectKeySchema } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { z } from "zod/v4";

export interface Attack {
  id: AttackId;
  soundEffectKey: SoundEffectKey;
}

export const attackSchema = z.object({
  id: attackIdSchema,
  soundEffectKey: soundEffectKeySchema,
}) satisfies z.ZodType<Attack>;
