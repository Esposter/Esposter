# Dist-tag Aliases

Read when a release the repo needs ships only under another package's name — a nightly line ahead of `latest` — or when `pnpm outdated:dependencies` lists a row labelled with a tag such as `(5x)`.

**The entry is an alias onto the tag, not a range.** `nuxt: npm:nuxt-nightly@5x` installs the newest build the publisher has put under `5x` and declares it under the name every manifest already imports, so no `catalog:` reference changes. It takes no `^`: the tag is what floats, and a caret on a per-commit prerelease would float across every build. Each one carries the `@TODO` linking the release that retires it (the `todos` skill), and goes back to `^<version>` when that release reaches `latest`. A forced transitive one lives in `overrides:` instead, under that page's rules (`references/overrides.md`).

**Taking a newer build is a lockfile refresh, never a catalog edit.** The specifier names no version to move, so step 2 of `references/bumping-by-hand.md` has nothing to write for it; `pnpm refresh:lockfile` re-resolves the tag, and the lockfile it writes is the bump. Renovate's weekly `lockFileMaintenance` does the same on the branch it runs against: it deletes the lockfile and installs afresh, so the tag moves there unasked, and a `packageRules` entry that disables the alias does not hold it, since that rule matches package updates, not the whole-lockfile one. The hand refresh is for taking a build before the next maintenance run.

**How the report reads one** — in every group a lockfile resolves (the catalog, `configDependencies`, an npm manifest):

- The mismatch table skips it, since a tag names no version for the resolution to drift from.
- The registry is asked for the alias's target at that tag and compared with the locked version, and the row is labelled with the tag. `pnpm outdated` cannot do this: it reports an alias under its target's name against `latest`, which a nightly line is already ahead of, so its row for the target is dropped.
- An alias the lockfile resolved nothing for is left out — the catalog's `nitro` is one, resolved under `overrides:`, where `pnpm outdated` reads `nitro-nightly` against `latest`, the tag it follows.
- A `renovate.json` `followTag` rule over an alias does not change the tag it is read at: the specifier's tag is what installs.
