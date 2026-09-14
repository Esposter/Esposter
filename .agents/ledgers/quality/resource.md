# Resource

| Unit                                                                                              | Swept      | Notes                                                                   |
| ------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `Resource/List` + list composables                                                                | 2026-09-14 |                                                                         |
| `Resource/Blade`, `Resource/Overview`, `Resource/Explorer`                                        | 2026-09-14 |                                                                         |
| `Resource/Sheet` components                                                                       | 2026-09-14 |                                                                         |
| `composables/resource/sheet`                                                                      | 2026-09-14 |                                                                         |
| `services/resource/sheet`                                                                         | 2026-09-14 |                                                                         |
| `store/resource/sheet` + `shared/models/resource/sheet`                                           | 2026-09-14 | content-class casts pinned by `ResourceContent.test-d.ts`               |
| `Resource/Dashboard`, `Resource/Email`, `Resource/Webpage`, `Resource/Flowchart`                  | 2026-09-14 |                                                                         |
| `Resource/Survey`, `Resource/Program`, `Resource/TodoList`, `Resource/Blueprint`, `Resource/Note` | 2026-09-14 |                                                                         |
| `app/composables/resource` + `app/services/resource`, less the `sheet` and list units above       | 2026-09-14 |                                                                         |
| `app/store/resource`, less the `sheet` unit above                                                 | 2026-09-14 |                                                                         |
| `Dashboard`, `Dataset`, `FlowchartEditor` + their store, composable and service layers            | 2026-09-14 |                                                                         |
| `emailEditor`, `webpageEditor`, `grapesjs`, `survey` — store, composables, services               | 2026-09-14 | their components are swept above; their shared models are `shared.md`'s |
| `Resource/` root files less `Overview.vue`                                                        | —          | the dialogs, toggles and readouts a blade mounts, owned by no blade     |
| `Resource/Create`, `Home`, `RecycleBin`, `Search`, `VersionHistory`                               | —          |                                                                         |
| `app/models/resource/sheet`                                                                       | —          |                                                                         |
| `app/models/resource` less `sheet`                                                                | 2026-09-14 |                                                                         |
