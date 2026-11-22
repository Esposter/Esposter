# Claude mods

Each plugin's hooks module against the rules the engine enforces at load.

Greps, over the scope, with explicit paths (zsh does not split a variable into pathspecs):

1. `git grep -n -E '\$\.process\.(run|spawn)\(|for await \('` over `packages/genshin-mods packages/genshin-persona/mod packages/follow-ups/hooks`. Read the action each hit sits in. A timer's action, a button's press or a `runDetached` action takes no promise back, so each call in it settles in a `Promise.allSettled` there. A `command.run` or a hook answers its engine call, which delivers a rejection itself, and `sinsScript.ts` is a plugin script's own top level: neither is a hit.
