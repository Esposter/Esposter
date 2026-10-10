import { z } from "zod";

// The login's age rating badge as paths: the glyph of its age and the text of its notice, each drawn under the
// Transform the screen gives it
export interface LoginAgeRating {
  age: string;
  notice: string;
}

export const loginAgeRatingSchema = z.object({
  age: z.string().nonempty(),
  notice: z.string().nonempty(),
}) satisfies z.ZodType<LoginAgeRating>;
