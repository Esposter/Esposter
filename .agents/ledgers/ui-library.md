# UI Library

Each unit moved off Vuetify onto the library: its flows inventoried in the commit body before a template is touched, laid out as the unit should be rather than as Vuetify arranged it, and checked by eye. Ordered as the page migration stage orders them — the first units settle the library, the later ones reach the most readers.

| Unit                                                                                                                   | Swept                 | Notes                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| `pages/about.vue`, `components/About`, `components/Visual/Card`                                                        | 2026-09-24 · Opus 5.5 | the gem and the globe are canvases and stay as they are                                               |
| `pages/privacy-policy.vue`                                                                                             | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `pages/login.vue`, `components/Login`                                                                                  | 2026-09-24 · Opus 5.5 | each provider's button keeps its brand's published look                                               |
| `pages/user/settings.vue`, `components/User` — the settings cards                                                      | 2026-09-24 · Opus 5.5 | `IntroductionCard`, `ProfileCard`, `LinkedAccountsCard`, `SessionsCard`, `Settings`                   |
| `pages/achievements.vue`, `components/Achievement`                                                                     | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `pages/user/[id].vue`, `components/User/Profile`                                                                       | 2026-09-24 · Opus 5.5 | the post cards on it are the posts unit's                                                             |
| `pages/docs`, `components/Docs`, `components/content`                                                                  | 2026-09-24 · Opus 5.5 | the readable-text setting arrives here                                                                |
| `pages/index.vue`, `pages/post`, `components/Post`, `components/RichTextEditor`                                        | 2026-09-24 · Opus 5.5 | the landing page is the post feed; the editor is themed from outside                                  |
| `layouts/resource.vue`, `components/App/Breadcrumbs.vue`, `components/Resource/Blade`                                  | 2026-09-24 · Opus 5.5 | the first page header: the breadcrumbs and the page overflow menu arrive here                         |
| `components/Resource/List`                                                                                             | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `pages/resource-explorer`, `components/Resource/Home`, `Search`, `Explorer`, `RecycleBin`                              | 2026-09-24 · Opus 5.5 | Home's resources gain a context menu                                                                  |
| `components/Resource/Sheet`, `components/Dataset`                                                                      | 2026-09-24 · Opus 5.5 | a sheet column gains a context menu                                                                   |
| `components/Resource` — the per-type editors                                                                           | 2026-09-24 · Opus 5.5 | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`                              |
| `components/Resource/Dashboard`, `components/Dashboard`, `components/Resource/Flowchart`, `components/FlowchartEditor` | 2026-09-24 · Opus 5.5 | the chart and flowchart engines are themed from outside                                               |
| `components/Resource` — the rest                                                                                       | 2026-09-24 · Opus 5.5 | `Create`, `VersionHistory` and the loose dialogs; `pages/view`                                        |
| `layouts/messages.vue`, `pages/messages`, `components/Message/LeftSideBar`, `components/Message/Friends`               | 2026-09-24 · Opus 5.5 | a room gains a context menu                                                                           |
| `components/Message/Model/Message`                                                                                     | 2026-09-24 · Opus 5.5 | the densest surface; its context menu already ships                                                   |
| `components/Message/Model/Room/Settings`                                                                               | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `components/Message/Model/Room` — the rest                                                                             | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `components/Message/Model` — the rest                                                                                  | 2026-09-24 · Opus 5.5 | `User`, `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`; a member gains a context menu |
| `pages/calls`, `components/Message/Content/Call`                                                                       | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `components/Message/Content` — the rest                                                                                | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `components/Message/RightSideBar`, `components/Message/DraftsAndSent`                                                  | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `pages/clicker.vue`, `components/Clicker`                                                                              | 2026-09-24 · Opus 5.5 | the game canvases are untouched                                                                       |
| `pages/anime.vue`, `components/Anime`, `components/Visual/Desmos`                                                      | 2026-09-24 · Opus 5.5 |                                                                                                       |
| `components/App` — the shell's last Vuetify parts                                                                      | 2026-09-24 · Opus 5.5 | `Dock/PageLink`, `ProductGroups`; the app root and drawers are retirement's                           |

## Exclusions

- `components/Styled` is no unit. A wrapper that draws a button or a dialog's action row is rebuilt on the library behind its current props, ahead of the units, so every consumer moves at once; any other wrapper is rebuilt or deleted as its last consumer migrates.
- `pages/dungeons.vue`, `pages/fluid-simulator.vue`, `pages/agent-console.vue` and `components/Dungeons` draw no Vuetify component.
- The dialog shell, the page drawers and the app root stay on Vuetify's overlay and `v-app` until retirement.

## Find recipe

```bash
grep -rlE '<v-[a-z]|<Styled' --include=*.vue apps/web/app
```
