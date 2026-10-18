import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { z } from "zod";

// A gadget as the widget config gives it: its item id, its kind, whether it can be equipped on Z, its cooldown in seconds, its
// Cooldown on a failed use and its cooldown group. The config gives no cooldown on a failed use or a group for some
// Gadgets, and those read as zero. The region is the one a Treasure Compass's city joins, and is empty for a gadget that
// Names no city. The gather item is the one an Oculus Resonance Stone finds, read from the gather point type its widget
// Names, and is zero for a gadget of another kind. The maximum points a collector holds are zero for any other gadget
export interface GadgetRow {
  cooldownGroup: number;
  cooldownOnFailSeconds: number;
  cooldownSeconds: number;
  gatherItemId: number;
  id: number;
  isEquipable: boolean;
  kind: GadgetKind;
  maxPoints: number;
  region: string;
}

export const gadgetRowSchema = z.object({
  cooldownGroup: z.int().nonnegative(),
  cooldownOnFailSeconds: z.int().nonnegative(),
  cooldownSeconds: z.int().nonnegative(),
  gatherItemId: z.int().nonnegative(),
  id: z.int().positive(),
  isEquipable: z.boolean(),
  kind: z.enum(GadgetKind) satisfies z.ZodType<GadgetKind>,
  maxPoints: z.int().nonnegative(),
  region: z.string(),
}) satisfies z.ZodType<GadgetRow>;
