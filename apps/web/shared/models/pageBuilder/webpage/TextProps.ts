import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import type { JSONContent } from "@tiptap/core";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { TEXT_SCHEMA } from "#shared/services/pageBuilder/text/constants";
import { createTextContentSchema } from "#shared/services/pageBuilder/text/createTextContentSchema";
import { z } from "zod";

export interface TextProps extends WebpageNodeProps {
  // The ProseMirror JSON the Note stores, held to the page's text schema
  content: JSONContent;
}

export const textPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  content: createTextContentSchema(TEXT_SCHEMA),
}) satisfies z.ZodType<TextProps>;
