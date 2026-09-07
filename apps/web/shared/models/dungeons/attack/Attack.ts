import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

import { attackIdSchema } from "#shared/models/dungeons/attack/AttackId";
import { fileKeySchema } from "#shared/models/dungeons/keys/FileKey";
import { z } from "zod";

export interface Attack {
  fileKey: FileKey;
  id: AttackId;
  power: number;
}

export const attackSchema = z.object({
  fileKey: fileKeySchema,
  id: attackIdSchema,
  power: z.int().positive(),
}) satisfies z.ZodType<Attack>;
