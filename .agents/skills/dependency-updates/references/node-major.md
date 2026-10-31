# Moving the node major

Read when a new node major ships, when `pnpm outdated:dependencies` lists the node group as held, when the Functions host gains a node major, or when asked whether the pin should move up. The pin stays on its major until the checklist below holds; `references/updating-node.md` is the procedure that then moves it.

## The target and its one exception

Every environment that runs this repo's node runs the pin's major. The one that does not is the Azure Functions host: its runtime supports fewer majors than node ships, so its `WEBSITE_NODE_DEFAULT_VERSION` is a hand-moved setting in `apps/infra` (the `pulumi-infra` skill's Settled list), and it stays on the major Functions supports until that support lands.

While the host is behind the pin, nothing in the build knows it. `@types/node` is the pin's, so typecheck passes an API only the pin's major has, and `apps/functions` vendors everything and the host runs the bundle on its own major. Code under `apps/functions`, and the packages it vendors, is therefore written for the host's major, and the pin does not widen what it may use.

## The hold

The pin cannot move ahead of its environments by accident, because the hold is one cap read two ways: the `node` group's `allowedVersions` in `renovate.json`, which `pnpm outdated:dependencies` reads as a hold, and `pnpm update:node` with no argument, which re-resolves the pin's own major and never `latest`. A minor or patch of the pinned major still lands through the bot on green.

## The checklist

A major moves when every line holds. A line that does not hold is the reason to wait.

1. **The major is in LTS**, never Alpha or Current. Every major reaches LTS on the release schedule's own date, so the check is that date for the major, never whether its number is odd or even. Current is for trying a release, and the Functions host publishes support against LTS.
2. **The Functions host supports it**, generally available and not preview, on the plan the sites run (the runtime's supported-languages table, Node.js row). This is the line that closes last, and the same line closes today's gap: once it holds for the pin's own major, the host moves to it.
3. **Every other runtime the repo ships to can run it** — each host or image that names a node version in a file the repo declares. List them by searching `apps/`, `packages/`, `.github/` and every `Dockerfile` for the current major rather than trusting a list written here, since a new environment would not be on it.
4. **`@types/node` has the major**, so `pnpm update:node` can resolve the catalog entry.
5. **The native and binary dependencies install on it.** An addon or a downloaded binary ships a prebuilt for the major or builds from source; `pnpm install` on the new pin is the check, and a package whose `engines` excludes the major is a hold of its own (`references/holding-a-dependency.md`).

## Moving it

In one change, in this order, so no commit leaves the pin ahead of an environment:

1. Move the Functions sites' `WEBSITE_NODE_DEFAULT_VERSION` to the new major, and any other runtime from line 3 with it. Preview and apply (`pnpm infra:preview`; the `pulumi-infra` skill's `references/operations.md`). When only the host is catching up to the existing pin, this step is the whole change.
2. Raise the `node` group's `allowedVersions` in `renovate.json` to the next major.
3. `pnpm update:node <major>`, then `pnpm refresh:lockfile` (`references/updating-node.md`), then the follow-through a bump owes (`references/bump-follow-through.md`).
