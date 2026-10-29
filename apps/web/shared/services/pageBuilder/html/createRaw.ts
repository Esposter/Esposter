import type { HtmlRawNode } from "#shared/models/pageBuilder/html/HtmlRawNode";

import { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

export const createRaw = (html: string): HtmlRawNode => ({ html, type: HtmlNodeType.Raw });
