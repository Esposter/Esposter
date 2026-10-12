---
title: Roadmap
description: Open cross-cutting work — each item a decision or a feature the build loop takes.
---

# Roadmap

Open work for the cross-cutting standards on this section, each item a decision or a feature. An idea waiting on a revisit trigger is parked in [deferred](/docs/architecture/deferred).

## Open

- [ ] **`pnpm dev`'s package build: whether a failed build stops the dev server, and whether it overlaps Nuxt's start.** [Build pipeline](/docs/architecture/build-pipeline) records that `apps/web`'s `dev` script runs the root `build:packages` task before `nuxt dev`. The script chains them with `&&`, so a package whose build fails exits `pnpm dev` before Nuxt starts. The module it replaced, which ran the build beside Nuxt's own preparation, logged a failed build and let Nuxt start, and a cold start now pays the whole package build before Nuxt's preparation begins, where that module overlapped the two. Decide whether a failed package build should stop `pnpm dev` or only warn, and whether the build should overlap Nuxt's start again, then state the choice on the build pipeline page.
- [ ] **The parity page's config path and build folder, which the root `vite.config.ts` restates.** The root build task `build:parity` names `parity/vite.config.ts` and the `parity-build` folder in its command and its cache patterns, the values `PARITY_CONFIG_PATH` and `PARITY_BUILD_DIRECTORY_NAME` own in `scripts/src/services/genshinParity/shared/constants.ts`, so changing either side leaves the other pointing at nothing. The root config cannot import scripts' constants without a new cross-package import. Decide whether the root config reads them through a shared module both packages import, or the scripts read the root's values, then have the one side the decision leaves read the other.
- [ ] **The upstream audit of `@codemirror/theme-one-dark`, owed by its replacement.** The code viewer's chrome and highlighting moved from the removed `@codemirror/theme-one-dark` to the app's own theme in `apps/web/app/services/codemirror/uiEditorExtensions.ts`, and that file's comment says the upstream tracker was only skimmed. The [dependency admission](/docs/architecture/dependency-admission) rule requires every upstream issue, open and closed, to get an evidenced verdict before the replacement lands, and the ledger row was dropped with no such record. Read the package's issue tracker whole, give each issue its verdict, and record them on a new docs page for the code viewer, which no page yet owns.
