# Effort Level

## Why

The composer shows and switches the model and the permission mode, but not how hard the model thinks, and it does not show the level the session is at. The terminal sets that with an effort command that works headless too, so the console can run it, but nothing on the page shows the current level or the levels the model takes. A reader working in the console has to leave it to find out or change either.

## What Changes

The Code tab gains an effort select beside the model select, opened with the same chord as the model select.

- An effort select beside the model select, opened by Ctrl+Shift+E, listing the levels the session's model supports.
- A model with no effort support shows no effort select.
- The levels come from the model the session is running, and a model switch that drops the current level shows the level the host reports next.
- Choosing a level applies it to this session only. The select shows the level the host last reported, so a refused change never shows as made.
- No default effort setting is added, and no thinking-token budget.

## Capabilities

- **infra/agent-console/effort-level** (new)

## Waiting on

None.

## Impact

- The composer gains an effort select and its chord.
- The session's model information carries the effort levels the model supports.
- The host gains a command that sets the level for one session.
- The sessions' settings event reports the effort level back to the page.
