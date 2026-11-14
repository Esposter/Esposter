# Moving the node major

Read when a new node major ships, when `pnpm outdated:dependencies` lists the node group as held, when a runtime the repo ships to gains a node major, or when asked whether the pin should move up. The pin stays on its major until the checklist below holds; `references/updating-node.md` is the procedure that then moves it.

## The target

Every environment that runs this repo's node runs the pin's major. The Workers are not one of them: they run on the Workers runtime, whose Node API surface is set by the `compatibility_date` and the `nodejs_compat` flag in `apps/functions/wrangler.jsonc`, so no node major is pinned there.

## The hold

The pin cannot move ahead of its environments by accident, because the hold is one cap read two ways: the `node` group's `allowedVersions` in `renovate.json`, which `pnpm outdated:dependencies` reads as a hold, and `pnpm update:node` with no argument, which re-resolves the pin's own major and never `latest`. A minor or patch of the pinned major still lands through the bot on green.

## The checklist

A major moves when every line holds. A line that does not hold is the reason to wait.

1. **The major is in LTS**, never Alpha or Current. Every major reaches LTS on the release schedule's own date, so the check is that date for the major, never whether its number is odd or even. Current is for trying a release.
2. **Every other runtime the repo ships to can run it** — each host that names a node version in a file the repo declares. List them by searching `apps/`, `packages/` and `.github/` for the current major rather than trusting a list written here, since a new environment would not be on it.
3. **`@types/node` has the major**, so `pnpm update:node` can resolve the catalog entry.
4. **The native and binary dependencies install on it.** An addon or a downloaded binary ships a prebuilt for the major or builds from source; `pnpm install` on the new pin is the check, and a package whose `engines` excludes the major is a hold of its own (`references/holding-a-dependency.md`).

## Moving it

In one change, in this order, so no commit leaves the pin ahead of an environment:

1. Move every other runtime the checklist's second line finds with a node version, in its own file, in the same change.
2. Raise the `node` group's `allowedVersions` in `renovate.json` to the next major.
3. `pnpm update:node <major>`, then `pnpm refresh:lockfile` (`references/updating-node.md`), then the follow-through a bump owes (`references/bump-follow-through.md`).
