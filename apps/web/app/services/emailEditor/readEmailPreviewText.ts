import type { Editor } from "grapesjs";

import { getEmailPreview } from "@/services/emailEditor/getEmailPreview";

// The line an inbox shows under the subject, as text: the preview's text node holds it unescaped
export const readEmailPreviewText = (editor: Editor): string =>
  getEmailPreview(editor)?.components().first()?.get("content") ?? "";
