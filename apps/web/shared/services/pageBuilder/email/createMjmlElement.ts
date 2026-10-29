import type { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import type { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";

import { createElement } from "#shared/services/pageBuilder/html/createElement";

// An empty attribute is one the author left unset, so it is left out and MJML applies its own default
export const createMjmlElement = (
  tag: ElementTag,
  attributes: Partial<Record<ElementAttribute, string | undefined>>,
  children: HtmlNode[] = [],
) => createElement(tag, Object.fromEntries(Object.entries(attributes).filter(([, value]) => value !== "")), children);
