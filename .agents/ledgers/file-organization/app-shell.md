# App Shell

| Unit                                                        | Notes                                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `app/services/resource` — the files at its root             |                                                                                              |
| `app/services/resource/activity`                            |                                                                                              |
| `app/services/resource/blueprint`                           |                                                                                              |
| `app/services/resource/list`                                |                                                                                              |
| `app/services/resource/note`                                |                                                                                              |
| `app/services/resource/program`                             |                                                                                              |
| `app/services/resource/search`                              |                                                                                              |
| `app/services/resource/sheet`                               |                                                                                              |
| `app/services/resource/survey`                              |                                                                                              |
| `app/services/resource/tag`                                 |                                                                                              |
| `app/services/resource/todoList`                            |                                                                                              |
| `app/services/message`                                      |                                                                                              |
| `app/services/dungeons`                                     |                                                                                              |
| `app/services` — the rest                                   | a file is named for its export, and a second map is a second file                            |
| `app/models` — the rest                                     | the resolver class hierarchies stay models, like the sheet commands                          |
| `app/util`                                                  | a type-only third-party import is the `util/types` escape, not a `services/` move            |
| `app/types`                                                 | ambient `.d.ts` only                                                                         |
| `app/composables/resource`                                  |                                                                                              |
| `app/composables/message`                                   |                                                                                              |
| `app/composables/dungeons`                                  |                                                                                              |
| `app/composables` — the rest                                | sole-consumer subfolders                                                                     |
| `app/store/message`                                         |                                                                                              |
| `app/store/dungeons`                                        |                                                                                              |
| `app/store/resource`                                        |                                                                                              |
| `app/store` — the rest                                      | a store's file is named for its domain, so the filename never matches its `use*Store` export |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins` | a route file's name is the router's, and a layout's name is the `NuxtLayout` key             |
| `app/components` — the rest                                 | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, the single-file folders                 |
| `app/components/Ui`                                         |                                                                                              |
| `app/services/ui`                                           |                                                                                              |
| `app/composables/ui`                                        |                                                                                              |
| `app/store/ui`                                              |                                                                                              |
| `app/models/ui`                                             |                                                                                              |
