# Typed commands

## Why

A patch writes exactly the paths it names. That is right for most edits, and wrong for a few: an act whose result code computes, such as renaming a Sheet column, which re-keys every row, and an act that must land on a row by its id while the owner keeps editing, since a path that addresses a row by position breaks once a row is inserted above it. Those few need typed commands, and a rule keeps them few.

## What Changes

A small set of typed commands serves the acts a patch fits badly, running the editor's own code, so an agent's result matches the one the editor produces.

- A Sheet column rename, type change or date format change made by an agent gives the same rows as the same change made in the sheet editor.
- A command that names a row by id lands on that row after the owner inserts rows above it, and a command based on older content applies to the newer content.
- Ticking a repeating todo, for a person or for an agent, rolls its due date to the next occurrence in its time zone rather than completing it. A follow-ups key ticks nothing the owner wrote.
- A Note's content can be written from Markdown, replacing it or appending to it, once the Markdown converter ships.
- The sheet editor's own undo history in the browser is unchanged.
- A webpage or an email is edited through patches, with no command of its own.

## Capabilities

- **architecture/ai-native-resources/typed-commands** (new)

## Waiting on

- `openspec/changes/resource-note-markdown-portability/`: the Markdown command for Notes waits on its converter. The rest of this change does not.

## Impact

- The Sheet's command classes, moved from the app's models into the shared layer so the server runs the same ones.
- The sheet editor's history, which builds the same commands from the shared layer.
- The sheet router, which gains a command procedure running inside the generic update service.
- The todo list router beside the follow-ups, which gains a tick procedure, and the shared recurring-item roll every tick uses, unchanged.
- The note router, which gains a Markdown write procedure.
