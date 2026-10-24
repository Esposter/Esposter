import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import { z } from "zod";

// The props of a webpage as a whole: the language its document declares, and its colour tokens. A token is named as its
// Custom property without the dashes, which a colour picked from the theme refers to, so editing it recolours every use
export interface WebpageRootProps {
  lang: string;
  tokens: Record<string, StyleValue>;
}

export const webpageRootPropsSchema = z.strictObject({
  lang: z.string().min(1),
  tokens: z.record(z.string().regex(/^color-[a-z][a-z\d-]*$/u), styleValueSchema).default({}),
}) satisfies z.ZodType<WebpageRootProps>;

// The root's form edits its language alone, since its tokens are edited in the Theme panel
export const webpageRootFormSchema = webpageRootPropsSchema.pick({ lang: true });
