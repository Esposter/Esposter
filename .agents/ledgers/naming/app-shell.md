# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                               | Swept                 | Notes                                                                                                                                          |
| ---------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/store` — the rest                                                             | 2026-09-24 · Opus 5.5 | the root stores plus `achievement`, `clicker`, `dashboard`, `post`, `survey`, the editors                                                      |
| `app/composables` — `shared`, `data`                                               | 2026-09-25 · Opus 5.5 | `useQuery` / `useMutation` and the primitives around them                                                                                      |
| `app/composables` — the small product subdirs and the root files                   | 2026-09-24 · Opus 5.5 |                                                                                                                                                |
| `app/services` — the rest                                                          | 2026-09-25 · Opus 5.5 | the third-party adapter trees and the singles                                                                                                  |
| `app/models` — `resolvers`, `shared`                                               | 2026-09-25 · Opus 5.5 |                                                                                                                                                |
| `app/models` — the rest                                                            | 2026-09-25 · Opus 5.5 | the third-party model trees and the singles                                                                                                    |
| `app/util`, `app/types`                                                            | 2026-09-25 · Opus 5.5 | a `.d.ts` augmenting a package mirrors that package's spellings                                                                                |
| `app/components` — the rest                                                        | 2026-09-25 · Opus 5.5 | the editor trees, the singles, the root files; a props shape another file reads is named after its own single export, not the auto-import path |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins`, the `app/` root files | 2026-09-25 · Opus 5.5 | a route file's name is the URL segment, so it is the router's spelling and not ours                                                            |
