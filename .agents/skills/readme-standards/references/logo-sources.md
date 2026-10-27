# Logo Sources

Read when adding, replacing or refreshing a logo under `.github/assets/`, or when a logo's source is in question.

Every project's logo comes from that project's own repository or website, and every file for one project comes from the same place, so the README's logos read as one set. These are README assets, not UI design sources; those are `openspec/specs/architecture/design-sources/design.md`'s.

## Order

1. **The project's own repository** — its logo or brand mark on the default branch.
2. **The project's own website or design kit**, when the repository holds no mark.
3. **`simple-icons/simple-icons`** (`icons/<name>.svg`), the open-source brand set, when neither has an SVG. Its paths are one colour, so the file takes the brand hex simple-icons publishes for the project (`data/simple-icons.json`) as the `<svg>` element's `fill`, and nothing else changes. That fill is the one recolour this form allows.

An icon set such as Streamline, a traced or redrawn copy, and any file found under `node_modules` are never sources.

## Form

- One file per project at `.github/assets/<name>/logo.svg`, copied byte for byte: nothing recoloured, resized or re-exported. The one exception is the simple-icons fill in Order step 3.
- A logo column takes the mark. A wordmark is used only when the project has no mark. The README gives no logo a size attribute, so each file's own size stands, and every cell in a README table is top-aligned (`valign="top"`), so the rows line up whatever the mark's shape.
- Fetch from `raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>`. A refresh fetches the same path.

## Sources

| Project                     | Source                          | Path (upstream, not a repo path, so not backticked)         |
| :-------------------------- | :------------------------------ | :---------------------------------------------------------- |
| Vue                         | `vuejs/art`                     | logo.svg                                                    |
| Nuxt                        | `nuxt/nuxt.com`                 | public/assets/design-kit/icon-green.svg                     |
| tRPC                        | `trpc/trpc`                     | www/static/img/logo.svg                                     |
| Zod                         | `colinhacks/zod`                | logo.svg                                                    |
| Drizzle                     | `drizzle-team/drizzle-orm-docs` | public/svg/drizzle-dark.svg (black mark)                    |
| Pulumi                      | `pulumi/docs`                   | assets/fingerprinted/logos/brand/pulumi-mark.svg            |
| Vite+                       | `voidzero-dev/vite-plus`        | docs/public/logo.svg (wordmark; the repository has no mark) |
| PostgreSQL                  | `postgres/pgweb`                | media/img/misc/Postgresql_elephant.svg                      |
| Railway, Namecheap, Vuetify | `simple-icons/simple-icons`     | icons/<name>.svg                                            |

Railway, Namecheap and Vuetify had no logo SVG in their project's repository or website when sourced, so they take the simple-icons fallback, filled with their brand hex: Namecheap `#DE3723`, Railway `#0B0D0E`, Vuetify `#1867C0`. Namecheap's website is behind a bot challenge, so its own SVG could not be fetched. The PostgreSQL elephant is the project's own vector art, the same as the colour PNG on postgresql.org.
