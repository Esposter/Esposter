import type { PageDocument } from "#shared/models/pageBuilder/PageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageRootProps } from "#shared/models/pageBuilder/webpage/WebpageRootProps";

export type WebpageDocument = PageDocument<WebpageRootProps, WebpageNode>;
