# UX

Placement and reachability, carried across the surfaces built before the rules were written. Standing: a unit's
date says the rules held there on that date, and the pass resumes from the files changed since.

Nothing here is lint-checkable. A feature reachable only from settings typechecks and passes every test — it is
wrong only from a seat in front of it — so this ledger is the only thing that finds it.

## Rules

| Rule                                                                       | Owner              |
| -------------------------------------------------------------------------- | ------------------ |
| Point-of-need entry point beside the management one                        | `ux` skill         |
| Settings panels configure and manage; creation forms move to dialogs       | `ux` skill         |
| One dialog shared by every surface that creates the same thing             | `ux` skill         |
| Standing controls are never displaced by a transient value                 | `ux` skill         |
| Reference-product wording, layout and interaction where the domain matches | `ux` skill         |
| A management surface exists only where its actions can succeed             | `ux` skill         |
| A button whose write waits on the server says so through `is-pending`      | `ui-library` skill |

## What a pass asks of each unit

For every feature the unit owns: **when does someone first want this?** If the only way to reach it from that
moment is a trip to settings, the entry point is missing. Then, for every settings panel the unit owns: is anything
in it a creation form rather than configuration?

Then the question the first two do not ask: **does the reference product ship this, and is its arrangement better
than ours?** Reachability can be right while the surface a reader arrives at is still the worse version of a screen
Discord or Slack already solved — the same state, the same permissions, a worse layout. That is a finding here, and
a better arrangement of our own is an acceptable answer to it, as long as a comment says what it departed from.

Last, for every button the unit owns that fires a write: **does the write change what the reader sees before the
server answers?** If not, and the button is not a dialog's answer, it binds `is-pending`.

## Find recipe

1. A write button with no pending state. A tag's attributes run across lines, so the pattern reads one tag whole:

   ```bash
   rg -U -P --pcre2 -n '<Ui(?:Icon)?Button\b(?![^>]*is-pending)[^>]*@click="(?:async|[^"]*?(?:save|delete|remove|create|update|submit|send|revoke|publish|upload|import|generate|restore|leave|join|accept|decline|block|request))' apps/web/app/components apps/web/app/pages -g '*.vue'
   ```

   Each hit is a question, not a finding: read the write it calls. An optimistic write (`writeOptimistic`), a dialog's answer and a local-only change take no pending state. So does a save the surface queues while one is out, such as the word filter's, since `UiButton`'s pending disables the button the queue needs to stay open. A write reached through a composable's item handler, such as `friendItem.onClick`, matches no pattern, so the unit read is the only check for it.

## Coverage

Notes on a tree several units share:

- custom emoji: `components/Message/Model/Room/Emoji` and `components/Message/Model/Room/Settings/Type/Emoji`; the emoji picker mounts the one create dialog
- the rest of room settings — the remaining panels: `components/Message/Model/Room/Settings` direct files, `LeftSideBar`, `Type/Invite`, `Type/Member` and `Type` direct files; which panels a member may see is a gate map with a test over it
- messaging — composer: `components/Message/Model/Message/Input`; a dialog's composer entry and its slash command share one execute switch and one icon
- messaging — rooms, invites, roles, moderation: the role toggle is one component over one composable, so no surface reads hierarchy itself
- resource editors — sheet dialogs, toolbar and the sheet's own files: `components/Resource/Sheet` direct files and `{Toolbar,EditDialog,ExportDialog}`; the sheet's Settings blade is its data-source configuration and nothing else
- user settings and profile — profile card and the user page: `components/Message/Model/User/ProfileCard` and `pages/user`; the settings dialog and `/user/settings` render the same cards rather than two forms
- posts and achievements: the reference products here are Reddit and GitHub
