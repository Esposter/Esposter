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

The package builds the headers, the nonce Content Security Policy, subresource integrity, the prerender policy, the header and CORS handlers, the allowed methods, basic auth and the request size limit, with its defaults written from the defaults review. Each part has unit tests, and each in-scope audit defect that this code fixes has a regression test titled with its issue number. The package typechecks, lints and builds. Its Nitro plugins are typed and built but not yet run inside a Nuxt app, so the app still runs the upstream package.

Not built yet, in order:

1. Run the plugins in a Nuxt app and check the headers, the nonce and the integrity attributes in a rendered page, including the `X-Powered-By` removal, whose framework header is not yet confirmed to reach the response.
2. Run each regression test against the upstream package and confirm it fails there first, where the reproduction is cheap.
3. Write the prerendered headers file for static hosts. The `ssg.nitroHeaders` and `ssg.exportToPresets` options are read but not yet acted on.
4. Verify the SRI behaviour on preload links (#655) and on entry import maps (#657) against a built app. Both are kept as they are until then.
5. Build the features the audit defers to a follow-up unit: the rate limiter, the XSS validator, CSRF, `removeLoggers`, strict mode, Zod options, and the route rules `security` key.
6. Swap the app's dependency onto the package, then remove the upstream catalog entry and the two workarounds it holds: the rate limiter's storage mounted with `rateLimiter: false`, and the prerender hook that reads Nitro 2's build-time storage. Those workarounds are `@TODO` markers in `pnpm-workspace.yaml`.
