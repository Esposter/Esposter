import { z } from "zod";

// The blessing a period of the Moon Spire gives, as its schedule row names it: its name and its description, each as a text
// Hash of the game's text, and its icon
export interface AbyssPeriodBlessing {
  descriptionTextHash: number;
  icon: string;
  nameTextHash: number;
}

export const abyssPeriodBlessingSchema = z.object({
  descriptionTextHash: z.int().nonnegative(),
  icon: z.string().min(1),
  nameTextHash: z.int().nonnegative(),
}) satisfies z.ZodType<AbyssPeriodBlessing>;
