# Dependencies

Every catalog entry, each with its verdict: kept, replaced by the platform or by something already installed, absorbed into our own code, or removed. The rubric and the score behind a verdict are `openspec/specs/architecture/dependency-admission/design.md`, and `pnpm ai:dependencies:score` scores every entry out of 100. The catalog derives the rows (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), so a new dependency opens here at `—` until it is judged. A Keep row is swept once judged. Any other row is swept by the commit that carries out its verdict, which also deletes the catalog entry and its row.

| Package                                 | Swept                 | Verdict           | Reason                                                                                                 |
| --------------------------------------- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `@anthropic-ai/claude-agent-sdk`        | —                     | Keep — SDK        | the agent console's session host                                                                       |
| `@arethetypeswrong/core`                | —                     | Keep — tooling    | tsdown's types check on every published package                                                        |
| `@azure/core-client`                    | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/core-http-compat`               | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/core-rest-pipeline`             | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/data-tables`                    | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/eventgrid`                      | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/functions`                      | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/identity`                       | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/search-documents`               | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/service-bus`                    | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/storage-blob`                   | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/storage-queue`                  | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/web-pubsub`                     | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@azure/web-pubsub-client`              | —                     | Keep — SDK        | a cloud SDK, on the stop list                                                                          |
| `@better-auth/api-key`                  | —                     | Keep — security   | authentication, on the stop list                                                                       |
| `@better-auth/drizzle-adapter`          | —                     | Keep — security   | authentication, on the stop list                                                                       |
| `@codemirror/lang-vue`                  | —                     | Keep — engine     | the code editor engine, on the stop list for accessibility                                             |
| `@codemirror/language`                  | —                     | Keep — engine     | the code editor engine, on the stop list for accessibility                                             |
| `@codemirror/language-data`             | —                     | Keep — engine     | the code editor engine, on the stop list for accessibility                                             |
| `@codemirror/state`                     | —                     | Keep — engine     | the code editor engine, on the stop list for accessibility                                             |
| `@dxup/nuxt`                            | —                     | Keep — tooling    | a TypeScript language-service plugin                                                                   |
| `@dxup/unimport`                        | —                     | Keep — tooling    | a TypeScript language-service plugin                                                                   |
| `@electric-sql/pglite`                  | —                     | Keep — engine     | in-memory PostgreSQL for the server tests                                                              |
| `@eslint/core`                          | —                     | Keep — tooling    | the linter's core                                                                                      |
| `@eslint/json`                          | —                     | Keep — tooling    | the linter's core                                                                                      |
| `@fission-ai/openspec`                  | —                     | Keep — tooling    | validates and archives the repository's specifications                                                 |
| `@fontsource/signika`                   | —                     | Keep — data       | font files                                                                                             |
| `@hpcc-js/wasm-graphviz`                | —                     | Keep — engine     | Graphviz layout for the dependency graph                                                               |
| `@huggingface/transformers`             | —                     | Keep — engine     | model inference                                                                                        |
| `@iconify-json/lucide`                  | —                     | Keep — data       | an icon set UnoCSS reads                                                                               |
| `@iconify-json/mdi`                     | —                     | Keep — data       | an icon set UnoCSS reads                                                                               |
| `@iconify-json/pixelarticons`           | —                     | Keep — data       | an icon set UnoCSS reads                                                                               |
| `@jsonforms/core`                       | —                     | Keep — engine     | the form engine under the schema form, which draws its own fields in place of the Vue bindings         |
| `@kjanat/actionlint`                    | —                     | Keep — tooling    | workflow lint                                                                                          |
| `@lerna-lite/cli`                       | —                     | Keep — tooling    | fixed-mode versioning and publishing, which pnpm does not do                                           |
| `@lerna-lite/publish`                   | —                     | Keep — tooling    | fixed-mode versioning and publishing, which pnpm does not do                                           |
| `@lezer/highlight`                      | —                     | Keep — engine     | the highlight tags the code viewer's theme maps, the engine's own vocabulary                           |
| `@livekit/track-processors`             | —                     | Keep — SDK        | the call SDK's video processing                                                                        |
| `@modelcontextprotocol/sdk`             | —                     | Keep — spec       | the MCP protocol                                                                                       |
| `@nuxt/eslint`                          | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/fonts`                           | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/image`                           | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/kit`                             | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/nitro-server`                    | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/schema`                          | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/scripts`                         | —                     | Keep — framework  | the framework's own module                                                                             |
| `@nuxt/test-utils`                      | —                     | Keep — tooling    | the app's test environment                                                                             |
| `@nuxtjs/seo`                           | —                     | Keep — framework  | the framework's SEO module                                                                             |
| `@oxlint/plugins`                       | —                     | Keep — tooling    | the repo's own oxlint rules load through it                                                            |
| `@panzoom/panzoom`                      | —                     | Keep — engine     | pointer, pinch and wheel interaction, where a hand-rolled version ships worse                          |
| `@pinia/nuxt`                           | —                     | Keep — framework  | the store's Nuxt module                                                                                |
| `@pulumi/azure-native`                  | —                     | Keep — SDK        | the infrastructure SDK                                                                                 |
| `@pulumi/github`                        | —                     | Keep — SDK        | the infrastructure SDK                                                                                 |
| `@pulumi/pulumi`                        | —                     | Keep — SDK        | the infrastructure SDK                                                                                 |
| `@standard-schema/spec`                 | —                     | Keep — types      | the Standard Schema interface                                                                          |
| `@takumi-rs/core`                       | —                     | Keep — framework  | the SEO module's OG image renderer                                                                     |
| `@tiptap/core`                          | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-code-block-lowlight` | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-file-handler`        | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-list`                | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-mention`             | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extension-table`               | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/extensions`                    | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/html`                          | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/pm`                            | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/starter-kit`                   | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/suggestion`                    | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tiptap/vue-3`                         | —                     | Keep — engine     | the rich-text editor engine, on the stop list for accessibility                                        |
| `@tresjs/cientos`                       | —                     | Keep — framework  | TresJS's helpers: the gem visual's orbit controls and its model and texture loaders                    |
| `@tresjs/core`                          | —                     | Keep — framework  | the declarative renderer the Genshin world is built on, its WebGPU renderer given through `TresCanvas` |
| `@trpc/client`                          | —                     | Keep — framework  | the API layer                                                                                          |
| `@trpc/server`                          | —                     | Keep — framework  | the API layer                                                                                          |
| `@tsdown/css`                           | —                     | Keep — tooling    | tsdown's CSS handling                                                                                  |
| `@types/js-beautify`                    | —                     | Keep — types      | declarations for `js-beautify`                                                                         |
| `@types/node`                           | —                     | Keep — types      | declarations for `node`                                                                                |
| `@types/sax`                            | —                     | Keep — types      | declarations for `sax`                                                                                 |
| `@types/three`                          | —                     | Keep — types      | declarations for `three`                                                                               |
| `@types/web-push`                       | —                     | Keep — types      | declarations for `web-push`                                                                            |
| `@types/ws`                             | —                     | Keep — types      | declarations for `ws`                                                                                  |
| `@typesafe-ai/sdk`                      | —                     | Keep — SDK        | the persona's model client                                                                             |
| `@unocss/eslint-config`                 | —                     | Keep — framework  | the styling engine's integration                                                                       |
| `@unocss/nuxt`                          | —                     | Keep — framework  | the styling engine's integration                                                                       |
| `@vite-pwa/nuxt`                        | —                     | Keep — framework  | the PWA module                                                                                         |
| `@vitest/browser`                       | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/browser-playwright`            | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/browser-preview`               | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/coverage-v8`                   | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/mocker`                        | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/pretty-format`                 | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/snapshot`                      | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/spy`                           | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vitest/utils`                         | —                     | Keep — tooling    | pinned for vite-plus's own vitest                                                                      |
| `@vue-flow/background`                  | —                     | Keep — hold       | held while the flowchart's future is decided (flowchart on the editor core, deferred)                  |
| `@vue-flow/controls`                    | —                     | Keep — hold       | held while the flowchart's future is decided (flowchart on the editor core, deferred)                  |
| `@vue-flow/core`                        | —                     | Keep — engine     | the flow-diagram engine                                                                                |
| `@vue-flow/minimap`                     | —                     | Keep — hold       | held while the flowchart's future is decided (flowchart on the editor core, deferred)                  |
| `@vue-flow/node-resizer`                | —                     | Keep — hold       | held while the flowchart's future is decided (flowchart on the editor core, deferred)                  |
| `@vue/compiler-core`                    | —                     | Keep — framework  | Vue's compiler, read by the app's tooling                                                              |
| `@vue/test-utils`                       | —                     | Keep — tooling    | component tests                                                                                        |
| `@vuetify/v0`                           | —                     | Keep — framework  | the UI library's headless base, on the stop list for accessibility                                     |
| `@vueuse/core`                          | —                     | Keep — framework  | the composable library                                                                                 |
| `@vueuse/nuxt`                          | —                     | Keep — framework  | auto-imports the composables                                                                           |
| `@vueuse/router`                        | —                     | Keep — framework  | route-query composables, auto-imported                                                                 |
| `@wasm-audio-decoders/ogg-vorbis`       | —                     | Keep — engine     | an Ogg Vorbis decoder                                                                                  |
| `@webgpu/types`                         | —                     | Keep — types      | WebGPU's declarations                                                                                  |
| `@xterm/addon-fit`                      | —                     | Keep — engine     | the terminal engine's sizing                                                                           |
| `@xterm/xterm`                          | —                     | Keep — engine     | the terminal engine                                                                                    |
| `apexcharts`                            | —                     | Keep — engine     | the chart engine, in a chunk of its own that only the routes drawing a chart load                      |
| `better-auth`                           | —                     | Keep — security   | authentication, on the stop list                                                                       |
| `bowser`                                | —                     | Keep — data       | user-agent tables for the session's device label, which change without us                              |
| `chokidar`                              | —                     | Keep — hold       | unstorage's fs driver loads it undeclared (`@TODO` in the catalog)                                     |
| `citty`                                 | —                     | Keep — tooling    | the CLI framework every command uses                                                                   |
| `codemirror`                            | —                     | Keep — engine     | the code editor's base setup                                                                           |
| `crossws`                               | —                     | Keep — framework  | the server's WebSocket layer                                                                           |
| `defu`                                  | —                     | Keep — free       | the framework installs it; the chart resolvers merge with it                                           |
| `diff`                                  | —                     | Keep — engine     | a diff algorithm                                                                                       |
| `drizzle-kit`                           | —                     | Keep — framework  | migrations                                                                                             |
| `drizzle-orm`                           | —                     | Keep — framework  | the ORM                                                                                                |
| `emojilib`                              | —                     | Keep — data       | emoji keywords, tracking Unicode                                                                       |
| `eslint`                                | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-depend`                  | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-jsonc`                   | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-oxlint`                  | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-perfectionist`           | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-pinia`                   | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `eslint-plugin-vuejs-accessibility`     | —                     | Keep — tooling    | the linter and its rules                                                                               |
| `fake-indexeddb`                        | —                     | Keep — tooling    | IndexedDB in the test environment                                                                      |
| `fflate`                                | —                     | Keep — spec       | the zip format, which `CompressionStream` does not write                                               |
| `grapesjs`                              | —                     | Keep — engine     | the page-builder engine                                                                                |
| `grapesjs-mjml`                         | —                     | Keep — engine     | the MJML compiler's integration                                                                        |
| `grapesjs-parser-postcss`               | —                     | Keep — engine     | the PostCSS parser's integration                                                                       |
| `grapesjs-plugin-export`                | —                     | Keep — engine     | the exporter (the admission doc's large plugins)                                                       |
| `grapesjs-preset-webpage`               | —                     | Keep — engine     | the webpage preset (the admission doc's large plugins)                                                 |
| `grapesjs-style-bg`                     | —                     | Absorb — own code | a small CommonJS plugin registering a block or trait (the admission doc's page-builder belt)           |
| `grapesjs-tabs`                         | —                     | Absorb — own code | a small CommonJS plugin registering a block or trait (the admission doc's page-builder belt)           |
| `grapesjs-tooltip`                      | —                     | Absorb — own code | a small CommonJS plugin registering a block or trait (the admission doc's page-builder belt)           |
| `grapesjs-touch`                        | —                     | Absorb — own code | a small CommonJS plugin registering a block or trait (the admission doc's page-builder belt)           |
| `grapesjs-tui-image-editor`             | —                     | Keep — engine     | the image editor (the admission doc's large plugins)                                                   |
| `grapesjs-typed`                        | —                     | Absorb — own code | a small CommonJS plugin registering a block or trait (the admission doc's page-builder belt)           |
| `grid-engine`                           | —                     | Keep — engine     | the tile-movement engine                                                                               |
| `h3`                                    | —                     | Keep — framework  | the server framework nitro is built on; the security module augments its route-rule types              |
| `happy-dom`                             | —                     | Keep — tooling    | the DOM test environment                                                                               |
| `imagetracerjs`                         | —                     | Keep — engine     | raster tracing for the glyph pipeline                                                                  |
| `js-beautify`                           | —                     | Keep — engine     | an HTML formatter                                                                                      |
| `jscpd`                                 | —                     | Keep — tooling    | the duplicate-code finder                                                                              |
| `knip`                                  | —                     | Keep — tooling    | unused files, exports and dependencies                                                                 |
| `link-preview-js`                       | —                     | Keep — utility    | maintained, with its own SSRF guard options                                                            |
| `linkifyjs`                             | —                     | Keep — data       | URL detection over the TLD list                                                                        |
| `livekit-client`                        | —                     | Keep — SDK        | the call SDK                                                                                           |
| `livekit-server-sdk`                    | —                     | Keep — SDK        | the call SDK                                                                                           |
| `lowlight`                              | —                     | Keep — engine     | required by the tiptap code-block extension                                                            |
| `lru-cache`                             | —                     | Keep — framework  | `@nuxt/scripts` mounts its storage on unstorage's lru-cache driver; knip cannot see the runtime load   |
| `marked`                                | —                     | Keep — engine     | the client's markdown parser                                                                           |
| `mathjs`                                | —                     | Keep — engine     | the expression engine                                                                                  |
| `mime-db`                               | —                     | Keep — data       | the IANA-derived dataset our `@esposter/shared` lookup reads, which changes without us                 |
| `minisearch`                            | —                     | Keep — engine     | the search index                                                                                       |
| `mlly`                                  | —                     | Keep — tooling    | the static export reader the module lists a package's exports with, never importing it                 |
| `mocked-exports`                        | —                     | Keep — hold       | Nitro 3 resolves it from the app (`@TODO` in the catalog)                                              |
| `msw`                                   | —                     | Keep — tooling    | request mocking                                                                                        |
| `neverthrow`                            | —                     | Keep — framework  | the `Result` the error-handling convention is built on                                                 |
| `nitro`                                 | —                     | Keep — framework  | the server framework                                                                                   |
| `node-html-parser`                      | —                     | Keep — engine     | HTML parsing with CSS selectors in the app, the server and the functions; parse5 has none              |
| `node-pty`                              | —                     | Keep — engine     | native pseudo-terminals                                                                                |
| `nuxt`                                  | —                     | Keep — framework  | the framework                                                                                          |
| `ohash`                                 | —                     | Keep — free       | the framework installs it                                                                              |
| `onnxruntime-common`                    | —                     | Keep — engine     | the inference interface pitch transcription takes as its peer, which Transformers.js already installs  |
| `onnxruntime-node`                      | —                     | Keep — engine     | the Node runtime that runs pitch transcription's model and the Genshin music fit                       |
| `oxfmt`                                 | —                     | Keep — tooling    | the formatter                                                                                          |
| `oxlint`                                | —                     | Keep — tooling    | the linter                                                                                             |
| `oxlint-tsgolint`                       | —                     | Keep — tooling    | oxlint's type-aware rules                                                                              |
| `parse5`                                | —                     | Keep — spec       | the WHATWG HTML parser the sanitiser is built on, an engine the sanitiser does not write for itself    |
| `pdfjs-dist`                            | —                     | Keep — engine     | the PDF renderer, on the stop list                                                                     |
| `phaser`                                | —                     | Keep — engine     | the game engine                                                                                        |
| `phaser4-rex-plugins`                   | —                     | Keep — engine     | maintained with Phaser 4; its size is hard-linked from the store, so it costs no disk per checkout     |
| `pinia`                                 | —                     | Keep — framework  | the store                                                                                              |
| `playwright`                            | —                     | Keep — tooling    | browser automation for the visual suites and parity                                                    |
| `postgres`                              | —                     | Keep — framework  | the PostgreSQL driver                                                                                  |
| `publint`                               | —                     | Keep — tooling    | tsdown's publish check                                                                                 |
| `rate-limiter-flexible`                 | —                     | Keep — security   | rate limiting on a Drizzle store; review against nuxt-security-module's limiter, which overlaps        |
| `read-excel-file`                       | —                     | Keep — spec       | the spreadsheet format                                                                                 |
| `rolldown`                              | —                     | Keep — tooling    | the bundler under tsdown and Vite                                                                      |
| `rollup-plugin-visualizer`              | —                     | Keep — tooling    | the analyzer `nuxt analyze` reads the client bundle through                                            |
| `rou3`                                  | —                     | Keep — free       | h3's own router, reused by nuxt-security-module                                                        |
| `rxjs`                                  | —                     | Keep — free       | grid-engine's own observables                                                                          |
| `sax`                                   | —                     | Keep — spec       | the XML tokenizer under parse-tmx's reader                                                             |
| `sharp`                                 | —                     | Keep — engine     | image processing                                                                                       |
| `sirv`                                  | —                     | Keep — tooling    | the static file server Vite's public middleware runs on, serving `public/` in dev                      |
| `superjson`                             | —                     | Keep — spec       | tRPC's wire transformer                                                                                |
| `survey-core`                           | —                     | Keep — engine     | the survey engine                                                                                      |
| `survey-creator-core`                   | —                     | Keep — engine     | the survey engine                                                                                      |
| `survey-creator-vue`                    | —                     | Keep — engine     | the survey engine                                                                                      |
| `survey-vue3-ui`                        | —                     | Keep — engine     | the survey engine                                                                                      |
| `temporal-polyfill`                     | —                     | Keep — hold       | until every target ships `Temporal`                                                                    |
| `three`                                 | —                     | Keep — engine     | the 3D engine                                                                                          |
| `three-globe`                           | —                     | Keep — engine     | the globe                                                                                              |
| `three-mesh-bvh`                        | 2026-10-11 · Opus 5.5 | Keep — engine     | the landmark collider's bounding volume hierarchy                                                      |
| `tsdown`                                | —                     | Keep — tooling    | the package bundler                                                                                    |
| `tsx`                                   | —                     | Keep — tooling    | runs TypeScript with enums, which node's type stripping refuses                                        |
| `type-fest`                             | —                     | Keep — types      | type utilities                                                                                         |
| `typescript`                            | —                     | Keep — tooling    | the compiler                                                                                           |
| `unicode-emoji-json`                    | —                     | Keep — data       | the emoji list, tracking Unicode                                                                       |
| `unocss`                                | —                     | Keep — framework  | the styling engine                                                                                     |
| `unplugin-auto-import`                  | —                     | Keep — tooling    | auto-imports in the packages' builds                                                                   |
| `unplugin-vue`                          | —                     | Keep — tooling    | Vue SFCs in the packages' builds                                                                       |
| `unstorage`                             | —                     | Keep — hold       | Nitro 3 resolves it from the app for its key-value mounts (`@TODO` in the catalog)                     |
| `vite`                                  | —                     | Keep — tooling    | the dev server and bundler                                                                             |
| `vite-plugin-glsl`                      | —                     | Keep — tooling    | the shader plugin the module loads only when its glsl option is on, an optional peer                   |
| `vite-plus`                             | —                     | Keep — tooling    | the task runner, lint and format                                                                       |
| `vitest`                                | —                     | Keep — tooling    | the test runner                                                                                        |
| `vitest-browser-vue`                    | —                     | Keep — tooling    | browser-mode component tests                                                                           |
| `vue`                                   | —                     | Keep — framework  | the UI framework                                                                                       |
| `vue-eslint-parser`                     | —                     | Keep — tooling    | ESLint's Vue parser                                                                                    |
| `vue-router`                            | —                     | Keep — framework  | routing                                                                                                |
| `vue-tsc`                               | —                     | Keep — tooling    | Vue's typecheck                                                                                        |
| `web-push`                              | —                     | Keep — security   | push encryption, on the stop list                                                                      |
| `write-excel-file`                      | —                     | Keep — spec       | the spreadsheet format                                                                                 |
| `ws`                                    | —                     | Keep — engine     | the agent console's WebSocket server                                                                   |
| `zod`                                   | —                     | Keep — framework  | the schema library                                                                                     |
