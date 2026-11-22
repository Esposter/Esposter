# UI Library

Each unit read against the `ui-library` skill, its design pass walked, and its states driven in a browser where no test reaches (the `run-app` skill). Ordered by reach — the first units settle the library, the later ones reach the most readers.

| Unit                                                                                                                     | Notes                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pages/about.vue`, `components/About`, `components/Visual/Card`                                                          | the gem and the globe are canvases and stay as they are                                               |
| `pages/privacy-policy.vue`                                                                                               |                                                                                                       |
| `pages/login.vue`, `components/Login`                                                                                    | one neutral button per provider, told apart by its own mark                                           |
| `pages/user/settings.vue`, `components/User` — the settings cards                                                        | `IntroductionCard`, `ProfileCard`, `LinkedAccountsCard`, `SessionsCard`, `Settings`                   |
| `pages/achievements.vue`, `components/Achievement`                                                                       |                                                                                                       |
| `pages/user/[id].vue`, `components/User/Profile`                                                                         | the post cards on it are the posts unit's                                                             |
| `pages/index.vue`, `pages/post`, `components/Post`, `components/RichTextEditor`                                          | the landing page is the post feed; the editor is themed from outside                                  |
| `layouts/resource.vue`, `components/App/Breadcrumbs.vue`, `components/Resource/Blade`                                    | the first page header: the breadcrumbs and the page overflow menu arrive here                         |
| `components/Resource/List`                                                                                               |                                                                                                       |
| `pages/resource-explorer`, `components/Resource/Home`, `Search`, `Explorer`, `RecycleBin`                                | Home's resources gain a context menu                                                                  |
| `components/Resource/Sheet`, `components/Dataset`                                                                        | a sheet column gains a context menu                                                                   |
| `components/Resource` — the per-type editors                                                                             | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`                              |
| `components/Resource/Dashboard`, `components/Dashboard`                                                                  | the chart engines are themed from outside                                                             |
| `components/Resource` — the rest                                                                                         | `Create`, `VersionHistory` and the loose dialogs; `pages/view`                                        |
| `components/Message/Layout.client.vue`, `pages/messages`, `components/Message/LeftSideBar`, `components/Message/Friends` | a room gains a context menu                                                                           |
| `components/Message/Model/Message`                                                                                       | the densest surface; its context menu already ships                                                   |
| `components/Message/Model/Room/Settings`                                                                                 |                                                                                                       |
| `components/Message/Model/Room` — the rest                                                                               |                                                                                                       |
| `components/Message/Model` — the rest                                                                                    | `User`, `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`; a member gains a context menu |
| `pages/calls`, `components/Message/Content/Call`                                                                         |                                                                                                       |
| `components/Message/Content` — the rest                                                                                  |                                                                                                       |
| `components/Message/RightSideBar`, `components/Message/DraftsAndSent`                                                    |                                                                                                       |
| `pages/clicker.vue`, `components/Clicker`                                                                                | the game canvases are untouched                                                                       |
| `pages/anime.vue`, `components/Anime`, `components/Visual/Desmos`                                                        |                                                                                                       |
| `components/App` — the shell                                                                                             | `Dock/PageLink`, `ProductGroups`                                                                      |
| `pages/genshin.vue`                                                                                                      |                                                                                                       |
| `components/Ui`                                                                                                          |                                                                                                       |

## Exclusions

- `components/Styled` is no unit: each wrapper there is read with the units that consume it.
- `pages/dungeons.vue`, `pages/fluid-simulator.vue` and `components/Dungeons` draw no library component — the game is its canvas.

## Find recipe

```bash
# a native control, or a title tooltip, where a library component belongs
grep -rnE '<(button|input|select|textarea)[ >]| title="' --include=*.vue apps/web/app/components apps/web/app/pages apps/web/app/layouts | grep -v 'components/Ui/'
# a colour written by hand rather than a token
grep -rnE '#[0-9a-fA-F]{3,8}\b' --include=*.vue apps/web/app/components apps/web/app/pages apps/web/app/layouts | grep -v 'components/Ui/'
```
