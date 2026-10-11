---
title: nuxt-security-module
description: The Nuxt security module the repo is absorbing in place of nuxt-security — security headers, CSP with nonces, CORS, basic auth, a rate limiter, an XSS validator and a request size limiter, held to the upstream audit before any of its code is written.
---

# nuxt-security-module

`packages/nuxt-security-module` is the replacement for [nuxt-security](https://github.com/Baroshem/nuxt-security), the Nuxt module that sets security headers, a nonce-based Content Security Policy, CORS, basic auth, a rate limiter, an XSS validator and a request size limiter. The app runs this package in place of the upstream, whose catalog entry, patch and two workarounds are removed. This section is the record the package was built against.

The decision to absorb it, and the rule a security-shaped absorption meets, are recorded in [dependency admission](/docs/architecture/dependency-admission).

## Pages

- [Upstream audit](/docs/nuxt-security-module/upstream) — every issue and pull request on the upstream repository, open and closed, with its verdict and the severity of any security defect.
- [Defaults review](/docs/nuxt-security-module/defaults-review) — each header and option the module sets by default, its recommended value from the published sources, and a keep, change or remove verdict.

## Status

The package builds the headers, the nonce Content Security Policy, subresource integrity, the prerender policy, the header and CORS handlers, the allowed methods, basic auth, the request size limit, a rate limiter behind a store interface, CSRF by the double submit cookie, the route rules' `security` key and strict mode, and the `removeLoggers` option, which sets the bundler's `dropConsole`. Its module options are validated by one Zod schema per option group, so a bad option stops the build with its path. Each part has unit tests, and each in-scope audit defect that this code fixes has a regression test titled with its issue number. The package typechecks, lints and builds. Its Nitro plugins and middleware run inside the app, which registers the package in place of the upstream. The rendered headers, the nonce and the integrity attributes are still to be checked in a browser.

Decided not to build, with the reason on the [upstream audit](/docs/nuxt-security-module/upstream#decisions-not-built):

- The XSS validator, as its filter rejects ordinary text and passes a script once escaping is off.

Not built yet, in order:

1. Run the plugins in a Nuxt app and check the headers, the nonce and the integrity attributes in a rendered page, including the `X-Powered-By` removal.
2. Run each regression test against the upstream package and confirm it fails there first, where the reproduction is cheap.
3. Write the prerendered headers file for static hosts. The `ssg.nitroHeaders` and `ssg.exportToPresets` options are read but not yet acted on.
4. Verify the SRI behaviour on preload links (#655) and on entry import maps (#657) against a built app. Both are kept as they are until then.
5. Build the FEATURE rows the audit judges worth having, each with a test named for its number.
