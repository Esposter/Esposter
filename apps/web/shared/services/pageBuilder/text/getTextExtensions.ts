import type { AnyExtension } from "@tiptap/core";

import { StarterKit } from "@tiptap/starter-kit";

// The one extension set a text node's schema, its render and its editor are built from, so what renders is what was
// Authored. A link never opens on a click inside the editor
export const getTextExtensions = (): AnyExtension[] => [StarterKit.configure({ link: { openOnClick: false } })];
