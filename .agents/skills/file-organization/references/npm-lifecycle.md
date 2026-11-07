# A package's life on npm

Read when a workspace package is created, renamed or removed and npm has to learn of it: a new name's first publish, its trust entry, a rename's old name, a removed package. The nightly release publishes every version after the first (`openspec/specs/architecture/release-flow/design.md`); this page owns the part no CI job can do, since each step below needs the owner's npm login and a one-time code.

## Before any write

- `npm whoami` prints the owner. A 401 means the session is gone: the owner types `! npm login`.
- A write takes a one-time code from the owner's authenticator. A code lives about half a minute and serves every write inside that window, so the writes are chained in one command (the publish, then each trust) and a code is never put in a file, a memory or a commit.
- Node and `pnpm` come from the `vite-plus` bin on `PATH`; `npm` there is the one that has `npm trust` and `npm stage`.

## A new name, in this order

1. **A clean tree.** `git status --porcelain` is empty: lerna rewrites each manifest while it packs (`workspace:*` and `catalog:` become versions) and restores it afterwards.
2. **Build what ships.** `files` is `dist`, and a stale `dist` ships stale: `vp run build:packages`, or `pnpm -C packages/<name> build` for one.
3. **Ask lerna what npm lacks.** `pnpm exec lerna publish from-package --dry-run --yes` lists exactly the names whose version is not on npm, and only the new packages should appear. A dry run leaves the publish-time rewrite on those manifests, so restore each with `git checkout -- packages/<name>/package.json` and confirm `git status --porcelain` is empty again.
4. **Publish.** `pnpm exec lerna publish from-package --yes --otp=<code>`. A brand-new name gets its `0.0.0-stage` placeholder from the registry first (description "Temporary package placeholder for staged publishing"), and the real version follows within minutes. Lerna counts a rejected version as "already published", so its "Successfully published" list is not evidence; the registry is (step 5). The placeholder's own version is never published by hand: the registry refuses it with `403 You cannot publish using the version: 0.0.0-stage`.
5. **Prove it on the registry**, not with lerna and not with `npm view`, which keeps answering a 404 it saw earlier: `curl -s "https://registry.npmjs.org/<name>?t=$RANDOM"`, reading `versions` and `dist-tags.latest`. The packument lags for minutes after a publish, so a version still missing is waited on and re-read before another code is spent. If it stays missing, repeat step 4 with a new code: lerna answers "already published" for whatever landed. A package that depends on another new name resolves only once that name has its version.
6. **Register the trust**, one per new name, 2 seconds apart, in the same code window as step 4 when it is still live: `npm trust github <name> --file Release.yaml --repo Esposter/Esposter --allow-publish --allow-stage-publish --yes --otp=<code>`. Each prints an `id:`. `Release.yaml` is the one workflow named, since npm matches the workflow that started the run and not the reusable `FinishRelease.yaml`, and npm refuses the command without a permission flag. `npm trust list <name>` takes a code too. An entry that has not yet published expires after 48 hours.
7. **Run the pipeline now, not at the nightly.** The last run's gate is read first (`gh run view <id> --log-failed`), since the dispatch repeats it. Then `gh workflow run Release.yaml --ref main`, and `gh run view <id>` until it completes. `version` gates and bumps (`forcePublish` moves every package together; a `feat` commit since the last tag makes the bump a minor, a breaking footer a major), `push` lands the version commit and its tag on `main`, and `finish` publishes through the trust entries with provenance. That first CI publish through each entry makes it permanent. Nothing lands on `ai/queue` between the dispatch and `push`: the review fast-forwards `main` with every queue commit, and `push` refuses a version commit made on an older `main` (`main moved since the version commit was made`). Nothing is pushed or tagged then, and the fix is a re-dispatch.
8. **Done** when the registry shows the new version on each new name with `dist.attestations` in its `dist`, and `git fetch origin main:main` brings the version commit local.

## A rename

The new name is a new package: the sequence above. The old name is kept: once the new name has a CI-published version and every published package that depended on the old name has a release depending on the new one, `npm deprecate "<old>@*" "Renamed to <new>" --otp=<code>`. A deprecation is reversed with an empty message and breaks no installed tree.

## A removal

No successor: the same `npm deprecate "<name>@*" "<why it is retired>" --otp=<code>`, and the package leaves the workspace in the commit that retires it.

## Unpublishing is the owner's call, never the default

A rename or a removal ends in a deprecation. A name is unpublished only when the owner says so, because it cannot be undone: no version of it can ever be published again, and the name is open to anyone after a day, so a stranger could publish under a name that installs already ask for.

npm allows it only while every version is young and nothing depends on it, or while weekly downloads are few and nothing depends on it. Check the dependents first by scanning every published workspace package's versions for the name in `dependencies`, `peerDependencies`, `optionalDependencies` and `devDependencies`, since that is the check npm makes and a release of the dependent never clears it: every older version still names it. Then, in the same code window as the deprecation was, `npm unpublish <name> --force --otp=<code>`. A name with no dependents and only young versions is removed (the registry then answers 200 with an empty `versions`). A name that fails the test is refused with `E422` on the `DELETE` of its packument, and stays deprecated.

Clearing the dependents is not the whole test, and `E422` does not say which half failed. A dependent's older versions can be unpublished one by one (`npm unpublish <dependent>@<version> --otp=<code>`, each a loss for whoever pinned it), and the scan then finds none, yet the delete can still be refused. Read `https://api.npmjs.org/downloads/point/last-week/<name>` before spending a code, and try the delete only when the count is low (npm's policy names 300). The count is a trailing week, so a name nothing new installs falls under it by waiting, and the delete is retried then with a fresh code.
