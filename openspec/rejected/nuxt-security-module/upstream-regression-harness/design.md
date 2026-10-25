# Upstream regression harness

The harness would run each needs-app regression test against the upstream nuxt-security package at 2.6.0, inside a Nuxt app, so that each test fails against upstream before it passes against the module. The [upstream audit](../../../specs/nuxt-security-module/upstream/design.md#fail-first-results) names that requirement for every regression test.

**Why not:** the app runs `packages/nuxt-security-module` in place of upstream, with the upstream catalog entry, patch and workarounds removed. A run against upstream would test a package the app no longer ships, and would settle only what upstream did. The needs-app defects also live inside a Nitro plugin or middleware that holds private state, so the harness would be test infrastructure in its own right, a larger job than the tests it would run.

**What stands instead:** the module's regression suite passes on the code the app actually loads. The probes that need no Nitro app already ran against upstream, and recorded their verdicts as fixed upstream. #83 and #196 pass through the app's rate limiter test (`apps/web/server/services/security/rateLimiter.test.ts`). The rest stay on the module's unit tests.

**What is accepted:** seven needs-app verdicts (#83, #196, #230, #266, #326, #329 and #602) rest on the issue thread alone and stay marked unverified. An unverified verdict is read as the thread's claim, which the audit's table already says it is.
