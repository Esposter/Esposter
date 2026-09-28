import type { Editor } from "grapesjs";

import { getEmailPreview } from "@/services/emailEditor/getEmailPreview";
import { escapeHtml } from "#shared/util/text/escapeHtml";

// Written as markup, since a component added by type serialises as a div the compiler ignores. The head keeps its other
// Children, and an email with none gains one as the root's first child; empty text leaves no preview at all
export const writeEmailPreviewText = (editor: Editor, text: string) => {
  getEmailPreview(editor)?.remove();
  if (!text) return;

  const wrapper = editor.getWrapper();
  if (wrapper?.findType("mj-head").length === 0)
    wrapper.findType("mjml")[0]?.components().add("<mj-head></mj-head>", { at: 0 });
  const [head] = wrapper?.findType("mj-head") ?? [];
  head?.append(`<mj-preview>${escapeHtml(text)}</mj-preview>`);
};
