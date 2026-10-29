import type { PageTokens } from "#shared/models/pageBuilder/style/PageTokens";

import { pageTokensSchema } from "#shared/models/pageBuilder/style/PageTokens";
import { pageLangSchema } from "#shared/services/pageBuilder/pageLangSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

export interface WebpageRootProps {
  lang: string;
  title: string;
  tokens: PageTokens;
}

export const webpageRootPropsSchema = z.object({
  lang: pageLangSchema,
  title: pageTextSchema,
  tokens: pageTokensSchema,
}) satisfies z.ZodType<WebpageRootProps>;
