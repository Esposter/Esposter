import { DESCRIPTION_MAX_LENGTH } from "#shared/services/constants";
import { z } from "zod";

export interface Description {
  description: string;
}

export const descriptionSchema = z.object({
  description: z.string().max(DESCRIPTION_MAX_LENGTH),
}) satisfies z.ZodType<Description>;
