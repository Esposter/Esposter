# Session Titles

## Why

A session's title is read from its transcript: a custom title if one was set, else Claude Code's summary, else the first prompt. The console draws it in the sessions tab and the heads-up display but cannot change it. Several sessions in one repository are then told apart only by whatever their first prompt happened to say, and a reader cannot give a session a name they will recognise.

## What Changes

The reader renames a session by clicking its title, and the new title is saved in the session's own transcript.

- Clicking the title in the heads-up display, or on a session's row in the sessions tab, turns it into an editable field. Enter saves, Escape keeps the old title, and an empty title saves nothing.
- The title is saved in the session's transcript, so the sessions list reads it back and it travels with the transcript.
- An open session's title updates at once on every connected page.
- A session with no transcript yet is renamed in memory, and its first prompt writes the title to the transcript.
- Tags and colours are not added.

## Capabilities

- **infra/agent-console/session-titles** (new)

## Waiting on

None.

## Impact

- The heads-up display and each row of the sessions tab accept a rename in place.
- The host saves a title into a session's transcript, or holds it until the first prompt.
- Every connected page redraws a renamed open session.

Size kept as the source page's own: splitting it is a later decision.
