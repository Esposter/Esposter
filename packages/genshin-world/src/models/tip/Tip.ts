import { z } from "zod";

// The watcher that shows a tip: the kind of trigger as the game's table spells it, and the parameters it is given, the
// Empty ones left out
export interface TipTrigger {
  paramList: string[];
  triggerType: string;
}

// A tutorial's push tip by the game's own id: the Archive entry the codex files it under, where it has one, its title and
// Subtitle by their text ids, and the trigger its watcher gives, where the game's table gives one. A tip with no trigger in
// The tables is shown by a script the dump does not hold, so the world never shows it
export interface Tip {
  codexId?: number;
  id: number;
  subtitleTextId: string;
  titleTextId: string;
  trigger?: TipTrigger;
}

export const tipTriggerSchema = z.object({
  paramList: z.array(z.string()),
  triggerType: z.string().min(1),
}) satisfies z.ZodType<TipTrigger>;

export const tipSchema = z.object({
  codexId: z.int().positive().optional(),
  id: z.int().positive(),
  subtitleTextId: z.string().min(1),
  titleTextId: z.string().min(1),
  trigger: tipTriggerSchema.optional(),
}) satisfies z.ZodType<Tip>;
