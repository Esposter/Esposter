# Markdown Format

Read when writing a page's markdown — its file format, a callout, an inline attribute, or a fenced code block.

- **File format is always `.md`, never `.mdx`.** MDX is the React ecosystem's format; @nuxt/content parses MDC syntax (`::component` blocks, `{.class}` props) inside plain `.md`, and `.md` stays readable on GitHub/editors/grep (`SKILL.md`, Settled).

- **Write plain GFM markdown — no MDC block components.** A `::note`/`::tip`/`::warning` block (as the Nuxt docs use) needs a prose component registered in our renderer, and none is. If they land later, adopt them for callouts only, never for layout. The one block a page holds renders an artifact the build generates and the page cannot carry as text: `::flow-map` (`app/components/content/FlowMap.vue`) draws the generated page-link map, which no hand-written diagram could keep current. MDC's **inline attribute** form is a different thing and does work, since @nuxt/content parses it by default; use it when a link needs to open a new tab.

- **Fence languages are bundled grammars**, listed in `configuration/content.ts` (`build.markdown.highlight.langs` — that list **replaces** the module defaults). A language missing from it renders as plain text with only a dev-server warning, so add the language there in the same change that first uses it. Use the short alias — `ts`, never `typescript` — so one fence language means one spelling.
