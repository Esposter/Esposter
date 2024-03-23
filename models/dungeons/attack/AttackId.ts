import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { z } from "zod";

export const AttackId = {
  [SpritesheetKey.IceShard]: SpritesheetKey.IceShard,
  [SpritesheetKey.Slash]: SpritesheetKey.Slash,
};
export type AttackId = keyof typeof AttackId;

export const attackIdSchema = z.nativeEnum(AttackId) satisfies z.ZodType<AttackId>;
