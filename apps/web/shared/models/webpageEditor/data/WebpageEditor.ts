import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import {
  MAX_RESOURCE_CONTENT_SIZE,
  RESOURCE_ASSETS_URL_PREFIX,
  WEBPAGE_DESCRIPTION_MAX_LENGTH,
} from "#shared/services/resource/constants";
import { URL_MAX_LENGTH } from "@esposter/db-schema";
import { z } from "zod";

// A webpage's working copy: the page builder's document, its tree and root, with the share preview the published page
// Unfurls with over the site's own. The image is one of the webpage's file assets, so duplicating the page clones it with the rest
export class WebpageEditor extends AItemEntity {
  content: WebpageNode[] = [];
  description = "";
  // The baked document of a published snapshot. The server renders it from the tree at publish, so no working copy holds it
  html?: string;
  imageUrl = "";
  root: { props: WebpageRootProps } = { props: { lang: "en", tokens: {} } };

  constructor(init?: Partial<WebpageEditor>) {
    super();
    Object.assign(this, init);
  }
}

// The document's schema, which takes the tree and root alone, with the item's identity and the share preview beside it
export const webpageEditorSchema = webpageDocumentSchema.and(
  z.object({
    ...aItemEntitySchema.shape,
    description: z.string().max(WEBPAGE_DESCRIPTION_MAX_LENGTH),
    html: z.string().max(MAX_RESOURCE_CONTENT_SIZE).meta({ readOnly: true }).optional(),
    imageUrl: z.literal("").or(z.string().startsWith(RESOURCE_ASSETS_URL_PREFIX).max(URL_MAX_LENGTH)),
  }),
) satisfies z.ZodType<ToData<WebpageEditor>>;
