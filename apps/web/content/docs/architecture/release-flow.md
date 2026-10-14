---
title: Release flow
description: The nightly release workflow, job by job — the one release job that versions, tags and publishes, the draft GitHub release, the host attachment and the gate that makes the release public.
---

# Release flow

`.github/workflows/Release.yaml` is the only path that tags a release, publishes packages to npm and creates a GitHub release. It runs nightly and ships `main`, so only what a review has passed reaches npm. The versioning mechanics and the `pnpm release` gates are owned by [monorepo tooling](/docs/architecture/monorepo-tooling); this page is the job graph.

The version, the tag, the npm publish and the draft release all happen in one `release` job, in that order, so a version reaches npm only from the same run that tagged it. Two jobs follow it: the Windows host is attached to the draft, and the release is made public last.

```mermaid
flowchart TD
  Trigger[Nightly at 15:16 UTC, or manual dispatch] --> Check{check: commits on main since the latest tag?}
  Check -- no --> Skip[Skipped: every later job]
  Check -- yes --> Release[release: pnpm release on main, gates then lerna version, then trusted publish]
  Release -- success --> Review[Review run on ai/queue merges main back]
  Release -- success --> Draft[Draft GitHub release on the tag]
  Release -- failure --> Held[No review run, no draft: the tag may exist without a release]
  Draft --> Host[host-installer: build the Windows host, attach it to the draft]
  Host --> Publish[publish: draft becomes public]
```

## Jobs

- **`check`** reads the latest tag and counts the commits on `main` since it. A count of zero skips the run, and every later job depends on `check`, so a quiet night does nothing.
- **`release`** checks out `main` as `REVIEW_COLLECTOR_TOKEN`, the identity `main`'s ruleset lets update it, and runs `pnpm release`. That runs the gates, then `lerna version`, which commits and tags the version and pushes it, then `lerna publish from-package`, which publishes through npm trusted publishing (`id-token: write`, no token). The job then starts a review run on `ai/queue` so the version commit reaches the queue, and creates a draft release on the tag with `gh release create --draft --verify-tag`. A re-run accepts an existing draft or an already-published release. [Monorepo tooling](/docs/architecture/monorepo-tooling) owns the reasons.
- **`host-installer`** runs on a Windows runner. It checks out the tag, builds the agent console host as a single executable, and attaches it to the draft with `--clobber`, so a re-run replaces the asset. It is skipped once the release is already public.
- **`publish`** makes the draft public with `gh release edit --draft=false`. It needs `release` and `host-installer` to have succeeded, so a public release always names a version that reached npm.

## Gates

| Gate                              | Where                  | Effect                                                                               |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Commits since the latest tag      | `check`                | A quiet night skips every job                                                        |
| One release at a time             | workflow `concurrency` | A run waits behind an earlier one on the same tag, never racing it                   |
| Gates before the version          | `pnpm release`         | A failed gate bumps, tags and publishes nothing                                      |
| npm success before the public tag | `release`, `publish`   | The draft exists only after the publish, and the release goes public only after both |
| Already-public release            | `release`, `publish`   | A re-run takes no further asset and does not publish twice                           |

## Notes

- The first publish of a new package is manual, because trusted publishing needs the package to exist on npm first. [Monorepo tooling](/docs/architecture/monorepo-tooling) gives the command.

- A failed `pnpm release` is not retried by a quiet night, because `check` skips the commits the tag covers. If the version push landed, the tag exists with no GitHub release and possibly no npm publish, and the version commit reaches `ai/queue` only at the next push to it, since that push starts a review run. The recovery is manual: check out the tag, run `pnpm exec lerna publish from-package --yes` (it publishes only the versions npm lacks), then `gh release create <tag> --draft --verify-tag` and attach the host. Make the release public with `gh release edit <tag> --draft=false` once it has its asset. `pnpm release` is not re-run at a tag, because its version step would bump again: `forcePublish` versions every member.

## Key files

| File                               | Role                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `.github/workflows/Release.yaml`   | the release jobs, their gates and their order              |
| `.github/actions/install-projects` | the install step every publish and check job shares        |
| `lerna.json`                       | the workspace globs lerna versions and publishes           |
| `package.json`                     | `release`, the script the release job runs, gates included |
