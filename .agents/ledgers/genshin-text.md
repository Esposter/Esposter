# Genshin text

Every word the game says, referenced by its text id and written by the generator.

Greps, over the scope, with explicit paths (zsh does not split a variable into pathspecs):

1. `git grep -n -E '\$\{[^}]*\}(min|[smhd])([^A-Za-z0-9_]|$)'` over `packages/genshin-text scripts/src/services/genshinText packages/genshin-world packages/genshin-interface packages/genshin-persona/src/localizations packages/genshin-persona/src/generated apps/web/app/composables/genshin`. A number followed by a hand-written English unit (`${days}d`, `${minutes}min`) is a game word the reader sees; a true hit reads the unit through the game's own key, as `formatForgeTime` and `formatShopRefreshCountdown` read `WishTimeRemainingDays`, `…Hours` and `…Minutes`. A CSS duration or an escape sequence is not a hit.
