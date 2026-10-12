---
title: Roadmap
description: Open cross-cutting work — each item a decision or a feature the build loop takes.
---

# Roadmap

Open work for the cross-cutting standards on this section, each item a decision or a feature. An idea waiting on a revisit trigger is parked in [deferred](/docs/architecture/deferred).

## Open

- [ ] **`pnpm dev`'s package build: whether a failed build stops the dev server, and whether it overlaps Nuxt's start.** [Build pipeline](/docs/architecture/build-pipeline) records that `apps/web`'s `dev` script runs the root `build:packages` task before `nuxt dev`. The script chains them with `&&`, so a package whose build fails exits `pnpm dev` before Nuxt starts. The module it replaced, which ran the build beside Nuxt's own preparation, logged a failed build and let Nuxt start, and a cold start now pays the whole package build before Nuxt's preparation begins, where that module overlapped the two. Decide whether a failed package build should stop `pnpm dev` or only warn, and whether the build should overlap Nuxt's start again, then state the choice on the build pipeline page.
