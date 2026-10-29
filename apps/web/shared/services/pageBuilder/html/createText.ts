import type { HtmlTextNode } from "#shared/models/pageBuilder/html/HtmlTextNode";

import { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

export const createText = (text: string): HtmlTextNode => ({ text, type: HtmlNodeType.Text });
