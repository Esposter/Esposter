import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { MAX_TYPED_TEXT_STRING_COUNT } from "#shared/services/pageBuilder/webpage/typedText/constants";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Strings typed and erased in turn. The whole set is the element's accessible text, and under reduced motion the first
// One stands still
export interface TypedTextProps extends WebpageNodeProps {
  isLoop: boolean;
  strings: string[];
}

export const typedTextPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  isLoop: z.boolean(),
  strings: createUniqueArraySchema(pageTextSchema.min(1)).min(1).max(MAX_TYPED_TEXT_STRING_COUNT),
}) satisfies z.ZodType<TypedTextProps>;
