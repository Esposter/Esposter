import { pageTokenNameSchema } from "#shared/services/pageBuilder/style/pageTokenNameSchema";
import { styleValueSchema } from "#shared/services/pageBuilder/style/styleValueSchema";
import { z } from "zod";

// The page's own named colours and font stacks, emitted as custom properties on :root, so a value picked from them
// Stores the property and editing the token restyles every node using it
export interface PageTokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

export const pageTokensSchema = z.object({
  colors: z.record(pageTokenNameSchema, styleValueSchema),
  fonts: z.record(pageTokenNameSchema, styleValueSchema),
}) satisfies z.ZodType<PageTokens>;
