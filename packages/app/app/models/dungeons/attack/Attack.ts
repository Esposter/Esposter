import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { AttackId } from "@/models/dungeons/attack/AttackId";

import { attackIdSchema } from "@/models/dungeons/attack/AttackId";
import { fileKeySchema } from "@/models/dungeons/keys/FileKey";
import { z } from "zod";

export interface Attack {
  fileKey: FileKey;
  id: AttackId;
}

export const attackSchema = z.object({
  fileKey: fileKeySchema,
  id: attackIdSchema,
}) satisfies z.ZodType<Attack>;
