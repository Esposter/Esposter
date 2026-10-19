import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";

export const createCountdownUnit = (name: string): HtmlElement => ({
  attributes: { [HtmlAttributeName.Class]: "countdown-unit", [HtmlAttributeName.DataUnit]: name },
  children: [
    { attributes: { [HtmlAttributeName.Class]: "countdown-value" }, children: [], tag: HtmlTag.Span },
    ` ${name}s`,
  ],
  tag: HtmlTag.Span,
});
