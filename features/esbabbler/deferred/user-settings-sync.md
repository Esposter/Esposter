# Cross-device sync of client-local user settings

Persist client-local user settings (Voice & Video, Appearance, Keybinds, auto-idle threshold) to the server so they follow the user across devices, instead of living only in each browser's `localStorage`.

## Why deferred

- The [user-settings surface](../specs/user-settings.md) ships first with `localStorage`-only client prefs — no migration, no procedures.
- Most of these are genuinely per-device (audio input/output device IDs, camera device) and should _not_ sync; Discord keeps them per-device too. Only a minority (theme, keybinds, input mode) are device-agnostic.
- Adding a `userSettings` table + read/update procedures + merge-on-conflict logic is real work that buys little until users routinely switch devices.

## Revisit when

The surface is shipped and users report losing device-agnostic prefs (theme, keybinds, input mode) when switching browsers/machines. At that point sync only the device-agnostic subset to a new `userSettings` table; leave device IDs local.
