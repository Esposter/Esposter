# Taking a major

Read when a red row appears in `pnpm outdated:dependencies`, or when Renovate opens a major PR. A minor or patch is a version write and nothing else; a major is a version write plus an **audit** — every breaking bullet answered against this repo, and every new capability weighed against what the repo hand-rolled in its absence. `SKILL.md` keeps the one line that a major waits for a person; this page is what that person does.

The output of the audit is the commit body, and it is the only record: nothing else remembers that a breaking change was read and found not to apply, so a bullet answered nowhere is a bullet the next session re-reads from scratch.

## 1. Read the release, from the release

The notes are fetched from the tag, not from a summary of them:

```bash
gh release view v15.0.0 --repo vueuse/vueuse
gh release list --repo vueuse/vueuse --limit 20   # when more than one major is being crossed
```

`gh` returns the publisher's verbatim bullets. A web fetch of the same page returns a model's précis of it, which drops bullets silently and gives no sign it did: a fetch of the VueUse v15 tag returns five breaking changes where `gh` returns six. Use a fetch afterwards, for an API page the notes only name (https://vueuse.org/core/useTemporalNow/), never for the list itself.

The repo behind a package is `pnpm view <package> repository.url` — not a guess from the scope. A monorepo publishes every one of its packages under one repo-wide tag, so `@vueuse/core`, `@vueuse/nuxt` and `@vueuse/router` are one release to read and one version to move together; a catalog holding them at different versions is the bug, not the plan.

**Crossing more than one major reads every release in between.** A removal announced in N+1 is absent from N+2's notes — the notes are a diff against the previous release, never against the version installed here. `gh release list` gives the set; read each one's breaking section.

## 2. Answer every breaking bullet with a grep

One bullet, one search, and the search is what goes in the commit body — "not applicable" without the command that established it is an assertion. Generated trees are excluded or the answer is wrong in the loud direction: the app's generated Nuxt import manifest names every auto-importable symbol the dependency ships, so a grep for a dropped export matches inside `.nuxt` whether or not a line of this repo ever called it.

```bash
grep -rnE "templateRef|useIDBKeyval|useEventSource" --include=*.ts --include=*.vue apps packages \
  --exclude-dir=.nuxt --exclude-dir=node_modules --exclude-dir=dist
```

A bullet that changes a **default** rather than an export cannot be grepped for the symbol alone — the call sites that pass the option explicitly are unaffected and the ones that don't are the hits, so the grep finds the callers and each one is read. VueUse 15 flipping `useThrottleFn`'s `trailing` from `false` to `true` is that shape: `useAutoSearch` passes `true` positionally and did not move.

A bullet naming a runtime the repo is already past (`Drop support for Node.js 20`) is answered by `engines.node` and closed in one line.

## 3. Read the features list — the migration is the point

A breaking-change audit that ends at "nothing breaks" has read half the release. The features section is where a major offers the thing the repo built by hand while it was missing, and **a major is the one moment that debt is cheap to shed**, because the version write and the migration are the same reviewed commit. So every new export is checked against what it would replace here, and each one is resolved either way in the commit body:

- **Migrate** when the new API removes a workaround, an adapter or a local helper — the workaround goes in the same commit as the bump, never in a follow-up nobody schedules.
- **Reject with the reason**, which is a real outcome and not a failure to look. A new API that is a different shape rather than a better one for this repo's use is left, and the reason is written down, because an unrecorded rejection is re-litigated by the next session that reads the same release notes (the `skill-authoring` skill's Settled list is where a rejection graduates to if it will be re-proposed against the same dependency every release).

VueUse 15's `useTemporalNow` is a worked rejection: the repo does hold every duration as a `Temporal.Duration` (the `typescript` skill), but `useCountdown` needs elapsed milliseconds between a `Date` off the database and now, and the new composable yields a `Temporal.ZonedDateTime` — taking it adds an `Instant` conversion at each end to arrive back at the same number, so `useNow` with a one-second `scheduler` stays.

## 4. Verify what the major actually reaches

Beyond `SKILL.md`'s "what a bump owes beyond the version" — which is the same list for a patch — a major reaches further, so the check suite is run against what it touched rather than the one package that names it:

- A dependency of `packages/configuration` (`unplugin-vue`, tsdown, a Vite plugin) is in **every** package's build, so its major is verified by building, not by typechecking.
- A Nuxt-module major (`@vueuse/nuxt`) changes the auto-import manifest, so the typecheck over `apps/web` is the audit's last step — a removed export that the grep in step 2 missed fails here and nowhere else.
- A major that moves bytes into a `dist/` moves the bundle snapshots, and the config snapshots (`apps/web/uno.config.test.ts`, `apps/web/vuetify.config.test.ts`) are read before they are regenerated — `SKILL.md` owns both.

## 5. One major per commit

Each major is its own commit — the catalog write, the lockfile, and the migration step 3 produced, together — with its own audit in the body. The patches and minors of the same pass are one commit ahead of them all. A commit carrying two majors cannot be reverted for the one that turned out wrong, and its body is two audits a reader has to separate.

The lockfile is what forces the shape, because it cannot be split: a commit whose `pnpm-lock.yaml` resolves versions its `pnpm-workspace.yaml` does not declare installs something nobody wrote. But splitting it is cheap, because a commit wants the **resolution**, not an install:

```bash
# Once, for the whole pass: install what the pass will end on, and verify against it
pnpm refresh:lockfile

# Then per commit, walking the catalog back to that commit's state — seconds, no reinstall
pnpm install --lockfile-only
```

`--lockfile-only` re-resolves against the edited catalog and leaves `node_modules` untouched, so the intermediate commits cost seconds each and nothing of anyone's is killed. Walking the catalog back to the pass's last state reproduces the refreshed lockfile byte for byte, which is the check that the split resolved honestly — `diff` it against a copy of the refreshed one taken before the first walk back, and a difference means a commit's lockfile is not what the pass verified.
