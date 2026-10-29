import { z } from "zod";

export enum EmailHeroMode {
  FixedHeight = "fixed-height",
  FluidHeight = "fluid-height",
}

export const emailHeroModeSchema = z.enum(EmailHeroMode) satisfies z.ZodType<EmailHeroMode>;
