# Dependencies

Every catalog entry, each with its verdict: kept, replaced by the platform or by something already installed, absorbed into our own code, or removed. The rubric and the score behind a verdict are `openspec/specs/architecture/dependency-admission/design.md`, and `pnpm ai:dependencies:score` scores every entry out of 100. The catalog derives the rows (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), so a new dependency opens here at `—` until it is judged. A Keep row is swept once judged. Any other row is swept by the commit that carries out its verdict, which also deletes the catalog entry and its row.

| Package                                 | Swept                   | Verdict          | Reason                                                                                                 |
| --------------------------------------- | ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `@anthropic-ai/claude-agent-sdk`        | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the agent console's session host                                                                       |
| `@arethetypeswrong/core`                | 2026-11-01 · Haiku 5.5  | Keep — tooling   | tsdown's types check on every published package                                                        |
| `@azure/core-client`                    | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/core-http-compat`               | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/core-rest-pipeline`             | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/data-tables`                    | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/eventgrid`                      | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/functions`                      | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/identity`                       | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/search-documents`               | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/service-bus`                    | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/storage-blob`                   | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/storage-queue`                  | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/web-pubsub`                     | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@azure/web-pubsub-client`              | 2026-11-01 · Haiku 5.5  | Keep — SDK       | a cloud SDK, on the stop list                                                                          |
| `@better-auth/api-key`                  | 2026-11-01 · Haiku 5.5  | Keep — security  | authentication, on the stop list                                                                       |
| `@better-auth/drizzle-adapter`          | 2026-11-01 · Haiku 5.5  | Keep — security  | authentication, on the stop list                                                                       |
| `@codemirror/lang-vue`                  | 2026-11-01 · Haiku 5.5  | Keep — engine    | the Vue language mode the code editor loads lazily                                                     |
| `@codemirror/language`                  | 2026-11-01 · Haiku 5.5  | Keep — engine    | the code editor engine, on the stop list for accessibility                                             |
| `@codemirror/language-data`             | 2026-11-01 · Haiku 5.5  | Keep — engine    | the registry of language grammars the code editor loads on demand                                      |
| `@codemirror/state`                     | 2026-11-01 · Haiku 5.5  | Keep — engine    | the code editor engine, on the stop list for accessibility                                             |
| `@dxup/nuxt`                            | 2026-11-01 · Haiku 5.5  | Keep — tooling   | a TypeScript language-service plugin                                                                   |
| `@dxup/unimport`                        | 2026-11-01 · Haiku 5.5  | Keep — tooling   | a TypeScript language-service plugin                                                                   |
| `@electric-sql/pglite`                  | 2026-11-01 · Haiku 5.5  | Keep — engine    | in-memory PostgreSQL for the server tests                                                              |
| `@eslint/core`                          | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter's core                                                                                      |
| `@eslint/json`                          | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the ESLint JSON language the dependency rule lints manifests with                                      |
| `@fission-ai/openspec`                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | validates and archives the repository's specifications                                                 |
| `@fontsource/signika`                   | 2026-11-01 · Haiku 5.5  | Keep — data      | the Signika font files the app loads and the parity page imports; they track the font's releases       |
| `@hpcc-js/wasm-graphviz`                | 2026-11-01 · Haiku 5.5  | Keep — engine    | Graphviz layout for the dependency graph                                                               |
| `@huggingface/transformers`             | 2026-11-01 · Haiku 5.5  | Keep — engine    | model inference                                                                                        |
| `@iconify-json/lucide`                  | 2026-11-01 · Haiku 5.5  | Keep — data      | an icon set UnoCSS reads                                                                               |
| `@iconify-json/mdi`                     | 2026-11-01 · Haiku 5.5  | Keep — data      | an icon set UnoCSS reads by class name; it tracks the set's releases, so a copy would drift            |
| `@iconify-json/pixelarticons`           | 2026-11-01 · Haiku 5.5  | Keep — data      | an icon set UnoCSS reads by class name; it tracks the set's releases, so a copy would drift            |
| `@jsonforms/core`                       | 2026-11-01 · Haiku 5.5  | Keep — engine    | the form engine under the schema form, which draws its own fields in place of the Vue bindings         |
| `@kjanat/actionlint`                    | 2026-11-01 · Haiku 5.5  | Keep — tooling   | workflow lint                                                                                          |
| `@lerna-lite/cli`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | fixed-mode versioning and publishing, which pnpm does not do                                           |
| `@lerna-lite/publish`                   | 2026-11-01 · Haiku 5.5  | Keep — tooling   | fixed-mode versioning and publishing, which pnpm does not do                                           |
| `@lezer/highlight`                      | 2026-11-01 · Haiku 5.5  | Keep — engine    | the highlight tags the code viewer's theme maps, the engine's own vocabulary                           |
| `@livekit/track-processors`             | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the call SDK's video processing                                                                        |
| `@modelcontextprotocol/sdk`             | 2026-11-01 · Haiku 5.5  | Keep — spec      | the MCP protocol                                                                                       |
| `@nuxt/eslint`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/fonts`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/image`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/kit`                             | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/nitro-server`                    | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/schema`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/scripts`                         | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's own module                                                                             |
| `@nuxt/test-utils`                      | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the app's test environment                                                                             |
| `@nuxtjs/seo`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework's SEO module                                                                             |
| `@oxlint/plugins`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the repo's own oxlint rules load through it                                                            |
| `@pinia/nuxt`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the store's Nuxt module                                                                                |
| `@pulumi/azure-native`                  | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the infrastructure SDK                                                                                 |
| `@pulumi/github`                        | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the infrastructure SDK                                                                                 |
| `@pulumi/pulumi`                        | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the infrastructure SDK                                                                                 |
| `@standard-schema/spec`                 | 2026-11-01 · Haiku 5.5  | Keep — types     | the Standard Schema interface                                                                          |
| `@takumi-rs/core`                       | 2026-11-01 · Haiku 5.5  | Keep — framework | the SEO module's OG image renderer                                                                     |
| `@tiptap/core`                          | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-code-block-lowlight` | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-file-handler`        | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-image`               | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-list`                | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-mention`             | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-table`               | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extensions`                    | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/html`                          | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/pm`                            | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/starter-kit`                   | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/suggestion`                    | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/vue-3`                         | 2026-11-01 · Haiku 5.5  | Keep — engine    | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tresjs/cientos`                       | 2026-11-01 · Haiku 5.5  | Keep — framework | TresJS's helpers: the gem visual's orbit controls and its model and texture loaders                    |
| `@tresjs/core`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the declarative renderer the Genshin world is built on, its WebGPU renderer given through `TresCanvas` |
| `@trpc/client`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the API layer                                                                                          |
| `@trpc/server`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the API layer                                                                                          |
| `@tsdown/css`                           | 2026-11-01 · Haiku 5.5  | Keep — tooling   | tsdown's CSS handling                                                                                  |
| `@types/mjml`                           | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `mjml`                                                                                |
| `@types/node`                           | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `node`                                                                                |
| `@types/sax`                            | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `sax`                                                                                 |
| `@types/three`                          | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `three`                                                                               |
| `@types/web-push`                       | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `web-push`                                                                            |
| `@types/ws`                             | 2026-11-01 · Haiku 5.5  | Keep — types     | declarations for `ws`                                                                                  |
| `@typesafe-ai/sdk`                      | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the typed-decision client behind the scripts' Jev and triage tools; the persona pins its own copy      |
| `@unocss/eslint-config`                 | 2026-11-01 · Haiku 5.5  | Keep — framework | the styling engine's integration                                                                       |
| `@unocss/nuxt`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the styling engine's integration                                                                       |
| `@vite-pwa/nuxt`                        | 2026-11-01 · Haiku 5.5  | Keep — framework | the PWA module                                                                                         |
| `@vitest/browser`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/browser-playwright`            | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the browser provider our browser-mode config imports, at the version vite-plus's peer names            |
| `@vitest/browser-preview`               | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/coverage-v8`                   | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the coverage provider the root's coverage script runs                                                  |
| `@vitest/mocker`                        | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/pretty-format`                 | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/snapshot`                      | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/spy`                           | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vitest/utils`                         | 2026-11-01 · Haiku 5.5  | Keep — tooling   | pinned for vite-plus's own vitest                                                                      |
| `@vue-flow/background`                  | 2026-11-01 · Sonnet 5.5 | Keep — hold      | held until the flowchart retirement removes it; its future is decided as removal                       |
| `@vue-flow/controls`                    | 2026-11-01 · Sonnet 5.5 | Keep — hold      | held until the flowchart retirement removes it; its future is decided as removal                       |
| `@vue-flow/core`                        | 2026-11-01 · Sonnet 5.5 | Keep — engine    | the flow-diagram engine                                                                                |
| `@vue-flow/minimap`                     | 2026-11-01 · Sonnet 5.5 | Keep — hold      | held until the flowchart retirement removes it; its future is decided as removal                       |
| `@vue-flow/node-resizer`                | 2026-11-01 · Sonnet 5.5 | Keep — hold      | held until the flowchart retirement removes it; its future is decided as removal                       |
| `@vue/compiler-core`                    | 2026-11-01 · Haiku 5.5  | Keep — framework | Vue's compiler, read by the app's tooling                                                              |
| `@vue/test-utils`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | component tests                                                                                        |
| `@vuetify/v0`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the UI library's headless base, on the stop list for accessibility                                     |
| `@vueuse/core`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | the composable library                                                                                 |
| `@vueuse/nuxt`                          | 2026-11-01 · Haiku 5.5  | Keep — framework | auto-imports the composables                                                                           |
| `@vueuse/router`                        | 2026-11-01 · Haiku 5.5  | Keep — framework | route-query composables, auto-imported                                                                 |
| `@webgpu/types`                         | 2026-11-01 · Sonnet 5.5 | Keep — types     | WebGPU's declarations                                                                                  |
| `@xterm/addon-fit`                      | 2026-11-01 · Haiku 5.5  | Keep — engine    | the terminal engine's sizing                                                                           |
| `@xterm/xterm`                          | 2026-11-01 · Haiku 5.5  | Keep — engine    | the terminal engine                                                                                    |
| `apexcharts`                            | 2026-11-01 · Haiku 5.5  | Keep — engine    | the chart engine, in a chunk of its own that only the routes drawing a chart load                      |
| `azurite`                               | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the local Azure Storage emulator the dev server starts when its storage connection string asks for it  |
| `better-auth`                           | 2026-11-01 · Haiku 5.5  | Keep — security  | authentication, on the stop list                                                                       |
| `bowser`                                | 2026-11-01 · Haiku 5.5  | Keep — data      | user-agent tables for the session's device label, which change without us                              |
| `chokidar`                              | 2026-11-01 · Haiku 5.5  | Keep — hold      | unstorage's fs driver loads it undeclared (`@TODO` in the catalog)                                     |
| `citty`                                 | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the CLI framework every command uses                                                                   |
| `codemirror`                            | 2026-11-01 · Haiku 5.5  | Keep — engine    | the code editor's base setup                                                                           |
| `crossws`                               | 2026-11-01 · Haiku 5.5  | Keep — framework | the server's WebSocket layer                                                                           |
| `defu`                                  | 2026-11-01 · Haiku 5.5  | Keep — free      | the framework installs it; the chart resolvers merge with it                                           |
| `diff`                                  | 2026-11-01 · Haiku 5.5  | Keep — engine    | a diff algorithm                                                                                       |
| `drizzle-kit`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | migrations                                                                                             |
| `drizzle-orm`                           | 2026-11-01 · Haiku 5.5  | Keep — framework | the ORM                                                                                                |
| `emojilib`                              | 2026-11-01 · Haiku 5.5  | Keep — data      | emoji keywords, tracking Unicode                                                                       |
| `eslint`                                | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-depend`                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-jsonc`                   | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-oxlint`                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-perfectionist`           | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-pinia`                   | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `eslint-plugin-vuejs-accessibility`     | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter and its rules                                                                               |
| `fake-indexeddb`                        | 2026-11-01 · Haiku 5.5  | Keep — tooling   | IndexedDB in the test environment                                                                      |
| `fflate`                                | 2026-11-01 · Haiku 5.5  | Keep — spec      | the zip format `CompressionStream` does not write: a DEFLATE codec, kept as an engine is               |
| `grid-engine`                           | 2026-11-01 · Haiku 5.5  | Keep — engine    | the tile-movement engine                                                                               |
| `h3`                                    | 2026-11-01 · Haiku 5.5  | Keep — framework | the server framework nitro is built on; the security module augments its route-rule types              |
| `happy-dom`                             | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the DOM test environment                                                                               |
| `imagetracerjs`                         | 2026-11-01 · Haiku 5.5  | Keep — engine    | raster tracing for the glyph pipeline                                                                  |
| `jscpd`                                 | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the duplicate-code finder                                                                              |
| `knip`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | unused files, exports and dependencies                                                                 |
| `link-preview-js`                       | 2026-11-01 · Haiku 5.5  | Keep — security  | its SSRF guard options, a security-shaped feed the stop list keeps                                     |
| `linkifyjs`                             | 2026-11-01 · Haiku 5.5  | Keep — data      | URL detection over the TLD list                                                                        |
| `livekit-client`                        | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the call SDK                                                                                           |
| `livekit-server-sdk`                    | 2026-11-01 · Haiku 5.5  | Keep — SDK       | the call SDK                                                                                           |
| `lowlight`                              | 2026-11-01 · Haiku 5.5  | Keep — engine    | required by the tiptap code-block extension                                                            |
| `lru-cache`                             | 2026-11-01 · Sonnet 5.5 | Keep — framework | `@nuxt/scripts` mounts its storage on unstorage's lru-cache driver; knip cannot see the runtime load   |
| `marked`                                | 2026-11-01 · Haiku 5.5  | Keep — engine    | the client's markdown parser                                                                           |
| `mime-db`                               | 2026-11-01 · Haiku 5.5  | Keep — data      | the IANA-derived dataset our `@esposter/shared` lookup reads, which changes without us                 |
| `minisearch`                            | 2026-11-01 · Haiku 5.5  | Keep — engine    | the search index                                                                                       |
| `mjml`                                  | 2026-11-01 · Haiku 5.5  | Keep — engine    | the MJML compiler, which the email editor's server and mjml-blocks' tests run under strict validation  |
| `mjml-preset-core`                      | 2026-11-01 · Haiku 5.5  | Keep — data      | MJML's component set and nesting map, which mjml-blocks' tables and slots are held equal to            |
| `mlly`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the static export reader the module lists a package's exports with, never importing it                 |
| `mocked-exports`                        | 2026-11-01 · Haiku 5.5  | Keep — hold      | Nitro 3 resolves it from the app (`@TODO` in the catalog)                                              |
| `msw`                                   | 2026-11-01 · Haiku 5.5  | Keep — tooling   | request mocking                                                                                        |
| `natural-orderby`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the barrel comparator, matching perfectionist's sort-exports, which depends on the same package        |
| `neverthrow`                            | 2026-11-01 · Sonnet 5.5 | Keep — framework | the `Result` the error-handling convention is built on                                                 |
| `nitro`                                 | 2026-11-01 · Haiku 5.5  | Keep — framework | the server framework                                                                                   |
| `node-html-parser`                      | 2026-11-01 · Haiku 5.5  | Keep — engine    | HTML parsing with CSS selectors in the app, the server and the functions; parse5 has none              |
| `node-pty`                              | 2026-11-01 · Haiku 5.5  | Keep — engine    | native pseudo-terminals                                                                                |
| `nuxt`                                  | 2026-11-01 · Haiku 5.5  | Keep — framework | the framework                                                                                          |
| `ohash`                                 | 2026-11-01 · Haiku 5.5  | Keep — free      | the framework installs it                                                                              |
| `onnxruntime-common`                    | 2026-11-01 · Haiku 5.5  | Keep — engine    | the inference interface pitch transcription takes as its peer, which Transformers.js already installs  |
| `onnxruntime-node`                      | 2026-11-01 · Haiku 5.5  | Keep — engine    | the Node runtime that runs pitch transcription's model and the Genshin music fit                       |
| `oxc-parser`                            | 2026-11-01 · Haiku 5.5  | Keep — tooling   | Nuxt's optional peers resolve to one forced copy until Nuxt pins the parser itself                     |
| `oxfmt`                                 | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the formatter                                                                                          |
| `oxlint`                                | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the linter                                                                                             |
| `oxlint-tsgolint`                       | 2026-11-01 · Haiku 5.5  | Keep — tooling   | oxlint's type-aware rules                                                                              |
| `parse5`                                | 2026-11-01 · Haiku 5.5  | Keep — spec      | the WHATWG HTML parser the sanitiser is built on, an engine the sanitiser does not write for itself    |
| `pdfjs-dist`                            | 2026-11-01 · Haiku 5.5  | Keep — engine    | the PDF renderer, on the stop list                                                                     |
| `phaser`                                | 2026-11-01 · Haiku 5.5  | Keep — engine    | the game engine                                                                                        |
| `phaser4-rex-plugins`                   | 2026-11-01 · Sonnet 5.5 | Keep — engine    | maintained with Phaser 4; its size is hard-linked from the store, so it costs no disk per checkout     |
| `pinia`                                 | 2026-11-01 · Haiku 5.5  | Keep — framework | the store                                                                                              |
| `playwright`                            | 2026-11-01 · Haiku 5.5  | Keep — tooling   | browser automation for the visual suites and parity                                                    |
| `postgres`                              | 2026-11-01 · Haiku 5.5  | Keep — framework | the PostgreSQL driver                                                                                  |
| `publint`                               | 2026-11-01 · Haiku 5.5  | Keep — tooling   | tsdown's publish check                                                                                 |
| `rate-limiter-flexible`                 | 2026-11-01 · Sonnet 5.5 | Keep — security  | rate limiting on a Drizzle store; review against nuxt-security-module's limiter, which overlaps        |
| `read-excel-file`                       | 2026-11-01 · Haiku 5.5  | Keep — spec      | the spreadsheet format                                                                                 |
| `rolldown`                              | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the bundler under tsdown and Vite                                                                      |
| `rollup-plugin-visualizer`              | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the analyzer `nuxt analyze` reads the client bundle through                                            |
| `rou3`                                  | 2026-11-01 · Haiku 5.5  | Keep — free      | h3's own router, reused by nuxt-security-module                                                        |
| `rxjs`                                  | 2026-11-01 · Haiku 5.5  | Keep — free      | grid-engine's own observables                                                                          |
| `sax`                                   | 2026-11-01 · Haiku 5.5  | Keep — spec      | the XML 1.0 tokenizer under parse-tmx's reader, a large format algorithm that stays a package          |
| `sharp`                                 | 2026-11-01 · Haiku 5.5  | Keep — engine    | image processing                                                                                       |
| `sirv`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the static file server Vite's public middleware runs on, serving `public/` in dev                      |
| `superjson`                             | 2026-11-01 · Haiku 5.5  | Keep — spec      | tRPC's wire transformer                                                                                |
| `survey-core`                           | 2026-11-01 · Haiku 5.5  | Keep — engine    | the survey engine, loaded with the survey's own components rather than at startup                      |
| `survey-creator-core`                   | 2026-11-01 · Haiku 5.5  | Keep — engine    | the survey engine's creator, in the chunk of the survey editor alone                                   |
| `survey-creator-vue`                    | 2026-11-01 · Haiku 5.5  | Keep — engine    | the survey engine's creator, in the chunk of the survey editor alone                                   |
| `survey-vue3-ui`                        | 2026-11-01 · Haiku 5.5  | Keep — engine    | the survey engine, loaded with the survey's own components rather than at startup                      |
| `temporal-polyfill`                     | 2026-11-01 · Haiku 5.5  | Keep — hold      | until every target ships `Temporal`                                                                    |
| `three`                                 | 2026-11-01 · Haiku 5.5  | Keep — engine    | the 3D engine                                                                                          |
| `three-globe`                           | 2026-11-01 · Haiku 5.5  | Keep — engine    | the globe                                                                                              |
| `three-mesh-bvh`                        | 2026-11-01 · Haiku 5.5  | Keep — engine    | the landmark collider's bounding volume hierarchy                                                      |
| `tsdown`                                | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the package bundler                                                                                    |
| `tsrs`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the type checker the plain typecheck scripts run                                                       |
| `type-fest`                             | 2026-11-01 · Haiku 5.5  | Keep — types     | type utilities                                                                                         |
| `typescript`                            | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the compiler                                                                                           |
| `unicode-emoji-json`                    | 2026-11-01 · Haiku 5.5  | Keep — data      | the emoji list, tracking Unicode                                                                       |
| `unocss`                                | 2026-11-01 · Haiku 5.5  | Keep — framework | the styling engine                                                                                     |
| `unplugin-auto-import`                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | auto-imports in the packages' builds                                                                   |
| `unplugin-vue`                          | 2026-11-01 · Haiku 5.5  | Keep — tooling   | Vue SFCs in the packages' builds                                                                       |
| `unstorage`                             | 2026-11-01 · Haiku 5.5  | Keep — hold      | Nitro 3 resolves it from the app for its key-value mounts (`@TODO` in the catalog)                     |
| `vite`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the dev server and bundler                                                                             |
| `vite-plugin-glsl`                      | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the shader plugin the module loads only when its glsl option is on, an optional peer                   |
| `vite-plus`                             | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the task runner, lint, format and the `vpx` script runner                                              |
| `vitest`                                | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the test runner                                                                                        |
| `vitest-browser-vue`                    | 2026-11-01 · Haiku 5.5  | Keep — tooling   | browser-mode component tests                                                                           |
| `vize`                                  | 2026-11-01 · Haiku 5.5  | Keep — tooling   | the Vue content mapper `tsrs` runs over `.vue` files, owned by the vize Vue typecheck change           |
| `vue`                                   | 2026-11-01 · Haiku 5.5  | Keep — framework | the UI framework                                                                                       |
| `vue-eslint-parser`                     | 2026-11-01 · Haiku 5.5  | Keep — tooling   | ESLint's Vue parser                                                                                    |
| `vue-router`                            | 2026-11-01 · Haiku 5.5  | Keep — framework | routing                                                                                                |
| `vue-tsc`                               | 2026-11-01 · Haiku 5.5  | Keep — tooling   | Vue's typecheck                                                                                        |
| `web-push`                              | 2026-11-01 · Haiku 5.5  | Keep — security  | push encryption, on the stop list                                                                      |
| `workbox-precaching`                    | 2026-11-01 · Haiku 5.5  | Keep — framework | the service worker's precache of the app shell                                                         |
| `workbox-routing`                       | 2026-11-01 · Haiku 5.5  | Keep — framework | the service worker's offline navigation route                                                          |
| `write-excel-file`                      | 2026-11-01 · Haiku 5.5  | Keep — spec      | the spreadsheet format                                                                                 |
| `ws`                                    | 2026-11-01 · Haiku 5.5  | Keep — engine    | the agent console's WebSocket server                                                                   |
| `zod`                                   | 2026-11-01 · Haiku 5.5  | Keep — framework | the schema library                                                                                     |
