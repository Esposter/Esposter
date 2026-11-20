import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { checkIsHtmlElement } from "#shared/services/pageBuilder/checkIsHtmlElement";

// Every panel but the first starts hidden, as a tab that is not selected does
export const hidePanel = (panel: HtmlNode): HtmlNode =>
  checkIsHtmlElement(panel) ? { ...panel, attributes: { ...panel.attributes, [HtmlAttributeName.Hidden]: "" } } : panel;
