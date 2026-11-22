# Genshin parity

Each screen, scene and piece of music held to its reference, and the tools that measure them.

Greps, over the scope, with explicit paths (zsh does not split a variable into pathspecs):

1. `git grep -n -i "recordings owed"` over `packages/genshin-interface packages/genshin-world scripts/src/services/genshinParity scripts/src/services/genshinAssets scripts/src/models/genshinParity`. A provisional value names the roadmap's list of owed recordings, which the roadmap holds as its `## References sought`; every hit is a stale name for it, and a true one is renamed to that heading.
