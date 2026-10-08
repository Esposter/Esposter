import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { z } from "zod";

// A gadget as the widget config gives it: its item id, its kind, whether it can be equipped on Z, its cooldown in seconds, its
// Cooldown on a failed use and its cooldown group. The config gives no cooldown on a failed use or a group for some
// Gadgets, and those read as zero
export interface GadgetRow {
  cooldownGroup: number;
  cooldownOnFailSeconds: number;
  cooldownSeconds: number;
  id: number;
  isEquipable: boolean;
  kind: GadgetKind;
}

export const gadgetRowSchema = z.object({
  cooldownGroup: z.int().nonnegative(),
  cooldownOnFailSeconds: z.int().nonnegative(),
  cooldownSeconds: z.int().nonnegative(),
  id: z.int().positive(),
  isEquipable: z.boolean(),
  kind: z.enum(GadgetKind) satisfies z.ZodType<GadgetKind>,
}) satisfies z.ZodType<GadgetRow>;
