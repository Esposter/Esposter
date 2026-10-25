import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import { MAX_LANG_LENGTH, MAX_TOKEN_NAME_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The props of a webpage as a whole: the language its document declares, and its tokens, colours and font stacks. A token
// Is named as its custom property without the dashes, which a colour or font picked from the theme refers to, so editing
// It restyles every use
export interface WebpageRootProps {
  lang: string;
  tokens: Record<string, StyleValue>;
}

const tokenNameSchema = z
  .string()
  .max(MAX_TOKEN_NAME_LENGTH)
  .regex(/^(?:color|font)-[a-z][a-z\d-]*$/u);

export const webpageRootPropsSchema = z.strictObject({
  lang: z.string().min(1).max(MAX_LANG_LENGTH),
  tokens: z.record(tokenNameSchema, styleValueSchema).default({}),
}) satisfies z.ZodType<WebpageRootProps>;

// The root's form edits its language alone, since its tokens are edited in the Theme panel
export const webpageRootFormSchema = webpageRootPropsSchema.pick({ lang: true });
