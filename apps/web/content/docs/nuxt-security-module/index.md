---
title: nuxt-security-module
description: The Nuxt security module the repo is absorbing in place of nuxt-security — security headers, CSP with nonces, CORS, basic auth, a rate limiter, an XSS validator and a request size limiter, held to the upstream audit before any of its code is written.
---

# nuxt-security-module

`packages/nuxt-security-module` is the replacement for [nuxt-security](https://github.com/Baroshem/nuxt-security), the Nuxt module that sets security headers, a nonce-based Content Security Policy, CORS, basic auth, a rate limiter, an XSS validator and a request size limiter. The absorption is in progress: our app still runs the upstream package, pinned at `2.6.0` with a patch, and this section is the record the absorption is built against.

The decision to absorb it, and the rule a security-shaped absorption meets, are recorded in [dependency admission](/docs/architecture/dependency-admission).

## Pages

- [Upstream audit](/docs/nuxt-security-module/upstream) — every issue and pull request on the upstream repository, open and closed, with its verdict and the severity of any security defect.
- [Defaults review](/docs/nuxt-security-module/defaults-review) — each header and option the module sets by default, its recommended value from the published sources, and a keep, change or remove verdict.

## Status

Only the audit and the defaults review exist. The package's code is the next phase: its defaults are written from the defaults review, each defect the audit records gets a regression test that fails against the upstream package first, and the swap replaces the upstream catalog entry and the two workarounds that are kept against it today. Those workarounds are `@TODO` markers in `pnpm-workspace.yaml`: the rate limiter's storage mounted with `rateLimiter: false`, and the prerender hook that reads Nitro 2's build-time storage. The package drops both.
