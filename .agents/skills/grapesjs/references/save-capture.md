# Content Capture at Save Time

Read when a published view needs HTML or CSS derived from the live editor.

GrapesJS project data is opaque; anything derived from the live editor must be captured in the store callback, not at publish/read time:

- **Webpage** — `saveWebpageEditor(data, { css: editor.getCss(), html: editor.getHtml() })` bakes the standalone render into `WebpageEditor.css/html`; the generic public route `apps/web/app/pages/view/[type]/[id].vue` renders `apps/web/app/components/Resource/Webpage/View.vue`, which serves it through the shared `apps/web/app/components/Resource/SrcdocIframe.vue` — a `srcdoc` iframe sandboxed to `allow-scripts` with no `allow-same-origin` — without loading GrapesJS.
- **Email** — `saveEmailEditor(data, editor)` re-attaches `EmailEditor.datasetReference` and bakes the compiled MJML into `EmailEditor.html` (MJML compiles only in the client editor), keeping the last captured HTML when a compile fails so the save still lands, and warning the author that the published view now lags the project; `apps/web/app/components/Resource/Email/View.vue` serves it through the same sandboxed iframe as Webpage. Always compile via `apps/web/app/services/emailEditor/getEmailHtml.ts` — never call `runCommand("mjml-code-to-html")` directly.
