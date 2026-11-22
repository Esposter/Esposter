# Genshin parity

Each screen, scene and piece of music held to its reference, and the tools that measure them.

Greps, over the scope, with explicit paths (zsh does not split a variable into pathspecs):

1. `git grep -n -i "recordings owed"` over `packages/genshin-interface packages/genshin-world scripts/src/services/genshinParity scripts/src/services/genshinAssets scripts/src/models/genshinParity`. A provisional value names the roadmap's list of owed recordings, which the roadmap holds as its `## References sought`; every hit is a stale name for it, and a true one is renamed to that heading.
2. `git grep -n -E 'WIKI_API_URL|WIKI_ORIGIN|api\.php'` over the same paths. Each hit is a read of the wiki's API, which answers HTTP 200 with an `error` key in place of its query, so an answer is parsed by its schema or read through `readWikiJson`'s guard before anything is written to a cache. A hit that writes before it parses is a true one; the wiki readers are `readFamilyLabelRedirects`, `readWikiPage`, `readImaginariumSeasonTitles`, `readWikiTalentPages`, `readWishPageTitles` and `readWholeScreenImages`.

Read unit by unit, since no grep decides them:

- A `] ?? []` fallback on an index. Most of the ninety hits are a keyed map with no entry for a key, or the type checker's answer to an index, where empty is the right value; the defect is a parallel array the loop assumes is as long as the loop, read past its end and measured as nothing, which only the loop's bounds show.
- A note string that states a fact about what was read, such as "none", for a value the code never reads. A note's claim is checked against the branch that writes it, which no grep names.
