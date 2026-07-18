import type { Editor } from "grapesjs";

// MJML compiles only in the client editor via the grapesjs-mjml plugin, so every consumer of the
// Compiled email (save-time capture for the published web view, personalized export) goes through here
export const getEmailHtml = (editor: Editor): string =>
  (editor.runCommand("mjml-code-to-html") as { html: string }).html;
