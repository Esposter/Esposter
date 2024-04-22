import type { AttackName } from "@/models/dungeons/attack/AttackName";
import { attackNameSchema } from "@/models/dungeons/attack/AttackName";
import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { soundEffectKeySchema } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { attackKeySchema } from "@/models/dungeons/keys/spritesheet/AttackKey";
import type { Except } from "@/util/types/Except";
import { z } from "zod";

export interface Attack {
  id: AttackKey;
  name: AttackName;
  soundEffectKey: SoundEffectKey;
}

export const attackSchema = z.object({
  id: attackKeySchema,
  name: attackNameSchema,
  soundEffectKey: soundEffectKeySchema,
}) satisfies z.ZodType<Except<Attack, "name"> & { name: string }>;
