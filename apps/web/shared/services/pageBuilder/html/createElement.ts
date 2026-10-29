import type { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import type { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import type { HtmlElementNode } from "#shared/models/pageBuilder/html/HtmlElementNode";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";

import { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

// An attribute given undefined is left out, so a render passes an unset prop straight through
export const createElement = (
  tag: ElementTag,
  attributes: Partial<Record<ElementAttribute, string | undefined>> = {},
  children: HtmlNode[] = [],
): HtmlElementNode => ({
  attributes: Object.fromEntries(Object.entries(attributes).filter(([, value]) => value !== undefined)),
  children,
  tag,
  type: HtmlNodeType.Element,
});
