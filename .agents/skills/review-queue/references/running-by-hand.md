# Running the collector by hand

Only with its workflow off: `gh workflow disable ReviewCollector.yaml` stops every trigger, and `pnpm ai:coderabbit:collect` then runs the same cycle from a checkout whose `gh` login is the collector's account — never this checkout, which the script switches branches in and refuses when dirty, but a detached `git worktree add` on `origin/develop` with its own `pnpm i` and `@esposter/shared` build. The run is asked for, like any push to `develop`.

`gh workflow enable ReviewCollector.yaml` hands the cycle back, and from then on it is never also run by hand: the compare-and-swap refuses the loser, but the drain the loser ran was a Claude session spent for nothing.

`--dry-run` needs none of this: it ports into a throwaway worktree, pushes nothing and runs no Claude session.
