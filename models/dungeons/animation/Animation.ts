import type { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { spriteSheetKeySchema } from "@/models/dungeons/keys/SpritesheetKey";
import { z } from "zod";

export interface Animation {
  key: SpritesheetKey;
}

export const animationSchema = z.object({
  key: spriteSheetKeySchema,
}) satisfies z.ZodType<Animation>;
