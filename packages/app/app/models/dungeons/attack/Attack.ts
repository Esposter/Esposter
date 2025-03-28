import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";

import { attackIdSchema } from "@/models/dungeons/attack/AttackId";
import { soundEffectKeySchema } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { z } from "zod";

export interface Attack {
  id: AttackId;
  soundEffectKey: SoundEffectKey;
}

export const attackSchema = z.object({
  id: attackIdSchema,
  soundEffectKey: soundEffectKeySchema,
}) as const satisfies z.ZodType<Attack>;
