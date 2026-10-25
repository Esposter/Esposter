# Upstream regression harness

## Revisit when

> Revisit when Baroshem/nuxt-security closes issue #602.

Issue [#602](https://github.com/Baroshem/nuxt-security/issues/602) is the open defect in the needs-app set, the one the audit still records as a defect with its verdict unverified, so its closure is the event that would change a verdict the audit still carries. Reviving this idea moves this folder into `openspec/changes/`.

## What the harness would be

The harness would run each needs-app regression test against the upstream nuxt-security package at 2.6.0, inside a Nuxt app: by driving the render hooks of the Nuxt renderer from inside Vitest, or by running a full Nuxt build there. The app's Vitest setup runs neither today. Each test would fail against upstream before it passed against the module, as the [upstream audit](../../../specs/nuxt-security-module/upstream/design.md#fail-first-results) requires of every regression test. The upstream package is not installed in the repository, so the harness would install it for the run only.

The regression tests whose probes need no Nitro app already ran against upstream. #118 is among them, and so is the rest of the fixed-upstream set (#194, #214, #395, #432 and #647). They pass, so their verdicts are recorded as fixed upstream. The harness would add only the needs-app issues, the set that the [audit's fail-first results](../../../specs/nuxt-security-module/upstream/design.md#fail-first-results) names.

## Why deferred

- The app runs `packages/nuxt-security-module` in place of upstream, with the upstream's catalog entry, patch and workarounds removed. A harness that runs upstream would test a package the app no longer ships, and its results would settle only what upstream did.
- The needs-app defects live inside a Nitro plugin or middleware holding private state, which a unit-level probe cannot get at. The harness would be test infrastructure in its own right, and a larger job than the tests it would run.
- The module's side of these issues is pinned where it can be. #83 and #196 pass through the app's rate limiter test (`apps/web/server/services/security/rateLimiter.test.ts`), and the rest stay on the module's unit tests, as the audit records.

## What the needs-app tests would prove

Each run against the 2.6.0 package would show whether the defect reproduces there. A run that reproduces it confirms the DEFECT verdict, and the module's test must keep pinning the behaviour the defect breaks. A run that passes moves the issue to fixed upstream, as the cheap probes already did for the others.

Seven of the needs-app verdicts rest on the thread alone and are marked unverified: #83, #196, #230, #266, #326, #329 and #602. The runs would settle those. Take #587: the branch that clears a header set to `false` runs only when that header matches the route rule's value, and no serializer probe gets there, so only a Nitro run can drive it.

## Cheaper interim

Until the trigger fires, an unverified verdict is read as the thread's claim, which the audit's table already says it is. The module's own tests decide what the module does, and the [roadmap](../../../changes/nuxt-security-module-roadmap/tasks.md) keeps the item open for the owner.
