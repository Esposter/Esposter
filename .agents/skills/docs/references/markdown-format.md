# Markdown Format

Read when writing a page's markdown — its file format, a callout, an inline attribute, or a fenced code block.

- **File format is always `.md`, never `.mdx`.** MDX is the React ecosystem's format; @nuxt/content parses MDC syntax (`::component` blocks, `{.class}` props) inside plain `.md`, and `.md` stays readable on GitHub/editors/grep. Settled — don't revisit.

- **Write plain GFM markdown — no MDC block components.** A `::note`/`::tip`/`::warning` block (as the Nuxt docs use) needs a prose component registered in our renderer, and none is. If they land later, adopt them for callouts only, never for layout. MDC's **inline attribute** form is a different thing and does work, since @nuxt/content parses it by default — it is used for exactly one link, the TypeDoc output that has to open in a new tab, and there is no reason to reach for it elsewhere.

- **Fence languages are bundled grammars**, listed in `configuration/content.ts` (`build.markdown.highlight.langs` — that list **replaces** the module defaults). A language missing from it renders as plain text with only a dev-server warning, so add the language there in the same change that first uses it. Use the short alias — `ts`, never `typescript` — so one fence language means one spelling.
