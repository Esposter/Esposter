import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { z } from "zod";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";

// The root's form edits its language alone, since its tokens are edited in the Theme panel
export interface WebpageRootForm extends Pick<WebpageRootProps, "lang"> {}

export const webpageRootFormSchema = webpageRootPropsSchema.pick({ lang: true }) satisfies z.ZodType<WebpageRootForm>;
