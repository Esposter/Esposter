# Resource

| Unit                                                                                              | Swept                  | Notes                                                                   |
| ------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| `Resource/List` + list composables                                                                | 2026-10-29 · Haiku 5.5 |                                                                         |
| `Resource/Blade`, `Resource/Overview`, `Resource/Explorer`                                        | 2026-10-29 · Haiku 5.5 |                                                                         |
| `Resource/Sheet` components                                                                       | 2026-10-29 · Haiku 5.5 |                                                                         |
| `composables/resource/sheet`                                                                      | 2026-10-29 · Haiku 5.5 |                                                                         |
| `services/resource/sheet`                                                                         | 2026-10-29 · Haiku 5.5 |                                                                         |
| `store/resource/sheet` + `shared/models/resource/sheet`                                           | —                      | content-class casts pinned by each schema's satisfies ToData            |
| `Resource/Dashboard`, `Resource/Email`, `Resource/Webpage`                                        | —                      |                                                                         |
| `Resource/Survey`, `Resource/Program`, `Resource/TodoList`, `Resource/Blueprint`, `Resource/Note` | —                      |                                                                         |
| `app/composables/resource` + `app/services/resource`, less the `sheet` and list units above       | —                      |                                                                         |
| `app/store/resource`, less the `sheet` unit above                                                 | —                      |                                                                         |
| `Dashboard`, `Dataset` + their store, composable and service layers                               | —                      |                                                                         |
| `emailEditor`, `webpageEditor`, `pageBuilder`, `survey` — store, composables, services            | —                      | their components are swept above; their shared models are `shared.md`'s |
| `Resource/` root files less `Overview.vue`                                                        | —                      | the dialogs, toggles and readouts a blade mounts, owned by no blade     |
| `Resource/Create`, `Home`, `RecycleBin`, `Search`, `VersionHistory`                               | 2026-10-29 · Haiku 5.5 |                                                                         |
| `app/models/resource/sheet`                                                                       | —                      |                                                                         |
| `app/models/resource` less `sheet`                                                                | —                      |                                                                         |
