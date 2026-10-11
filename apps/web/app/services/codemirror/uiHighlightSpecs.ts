import type { TagStyle } from "@codemirror/language";

import { UiToken } from "@/models/ui/UiToken";
import { tags } from "@lezer/highlight";

// The code viewer's highlighting, mapped the way the docs' shiki theme maps its scopes: keywords and tags in the accent,
// Strings and insertions in success, names in info, constants in warning, deletions in error and comments muted. Every
// Colour is the token's custom property, so the highlighting follows the style and the mode as the rest of the app does
export const uiHighlightSpecs: readonly TagStyle[] = [
  { color: `var(--ui-${UiToken.Muted})`, tag: tags.comment },
  { color: `var(--ui-${UiToken.Accent})`, tag: [tags.keyword, tags.heading, tags.tagName] },
  { color: `var(--ui-${UiToken.Success})`, tag: [tags.string, tags.regexp, tags.inserted] },
  {
    color: `var(--ui-${UiToken.Info})`,
    tag: [
      tags.typeName,
      tags.className,
      tags.function(tags.variableName),
      tags.propertyName,
      tags.attributeName,
      tags.link,
    ],
  },
  {
    color: `var(--ui-${UiToken.Warning})`,
    tag: [tags.number, tags.bool, tags.null, tags.atom, tags.constant(tags.variableName)],
  },
  { color: `var(--ui-${UiToken.Error})`, tag: [tags.deleted, tags.invalid] },
  { fontWeight: "bold", tag: tags.strong },
  { fontStyle: "italic", tag: tags.emphasis },
];
