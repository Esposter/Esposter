# Platform

| Unit                                                                                              | Swept      | Notes                                                                   |
| ------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `Resource/List` + list composables                                                                | 2026-08-20 |                                                                         |
| `Resource/Blade`, `Resource/Overview`, `Resource/Explorer`                                        | 2026-08-20 |                                                                         |
| `Resource/Sheet` components                                                                       | 2026-08-20 |                                                                         |
| `composables/resource/sheet`                                                                      | 2026-08-20 |                                                                         |
| `services/resource/sheet`                                                                         | 2026-08-20 |                                                                         |
| `store/resource/sheet` + `shared/models/resource/sheet`                                           | 2026-08-20 | content-class casts pinned by `ResourceContent.test-d.ts`               |
| `Resource/Dashboard`, `Resource/Email`, `Resource/Webpage`, `Resource/Flowchart`                  | 2026-08-20 |                                                                         |
| `Resource/Survey`, `Resource/Program`, `Resource/TodoList`, `Resource/Blueprint`, `Resource/Note` | 2026-08-20 |                                                                         |
| `app/composables/resource` + `app/services/resource`, less the `sheet` and list units above       | 2026-08-20 |                                                                         |
| `app/store/resource`, less the `sheet` unit above                                                 | 2026-08-20 |                                                                         |
| `Dashboard`, `Dataset`, `FlowchartEditor` + their store, composable and service layers            | 2026-08-20 |                                                                         |
| `emailEditor`, `webpageEditor`, `grapesjs`, `survey` — store, composables, services               | 2026-08-20 | their components are swept above; their shared models are `shared.md`'s |
