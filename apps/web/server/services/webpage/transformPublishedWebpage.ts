import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import type { ToData } from "@esposter/shared";

import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { renderWebpageDocument } from "#shared/services/pageBuilder/renderWebpageDocument";

// The published page is the whole HTML document, rendered from the tree at publish, so the snapshot serves it as it is.
// Its absolute links are written against the site's origin, which the server reads from its base url
export const transformPublishedWebpage: NonNullable<
  PublishableResourceProcedureOptions<ToData<WebpageEditor>>["transformPublishedContent"]
> = (_ctx, _resource, content) => ({
  ...content,
  html: renderWebpageDocument({ content: content.content, root: content.root }, { origin: getBaseUrl() }),
});
