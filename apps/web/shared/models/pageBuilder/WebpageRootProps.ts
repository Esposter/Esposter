import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import {
  COLOR_TOKEN_PREFIX,
  FONT_TOKEN_PREFIX,
  MAX_LANG_LENGTH,
  MAX_TOKEN_COUNT,
  MAX_TOKEN_NAME_LENGTH,
} from "#shared/services/pageBuilder/constants";
import { createRecordSchema } from "@esposter/shared";
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
  .regex(new RegExp(`^(?:${COLOR_TOKEN_PREFIX}|${FONT_TOKEN_PREFIX})[a-z][a-z\\d-]*$`, "u"));

export const webpageRootPropsSchema = z.strictObject({
  lang: z.string().min(1).max(MAX_LANG_LENGTH),
  tokens: createRecordSchema(tokenNameSchema, styleValueSchema, MAX_TOKEN_COUNT).default({}),
}) satisfies z.ZodType<WebpageRootProps>;
