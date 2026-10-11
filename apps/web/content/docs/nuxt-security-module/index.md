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

## Per-request cost

Each hot path is a benchmark beside its source, and each has a committed report of its means: the nonce, the headers, the route rules and the page rewrite in `src/runtime/nitro/plugins/` and `src/runtime/services/`, and the server chain in `src/runtime/server/middleware/`. The comparison with the upstream 2.6.0 ran once on the same host, over the same page of about sixty sections, with each path compared by its median. The figures are ratios and magnitudes, with the upstream's time over ours:

- **Applying the headers to a response** is about 6 times faster: a few microseconds against about 40. Upstream rebuilds each request's rules and writes its headers through its own helpers, where ours reads rules resolved once.
- **Rewriting a rendered page with its nonce and SRI attributes** is about 20 to 30 times faster: about 10 to 17 microseconds against about 330 to 360. This is the largest gap, since upstream's two rewrites run as regular expressions over each section after masking its quoted attributes, and ours scan each tag once.
- **Resolving a request's route rules** is about 5 times faster: a few microseconds against about 18. Upstream builds its router and clones its route table for every request. Ours matches a table built once at startup and merges the matched rules only for the event.
- **Generating the nonce** is the same on both sides, a few microseconds each. The module does not claim a gain here.
- **The whole server chain** is about 7 times faster under both configurations: a median of about 5 microseconds against about 35 to 38. The chain is the handlers each module registers for a request to a page path, measured in `src/runtime/server/middleware/serverChain.bench.ts` with the app's options and with a minimal configuration that keeps only the request size limit. Upstream registers its server middlewares whatever the config says, and each one runs on every request, looks up the route's rules and returns early when its feature is off. Ours registers a handler only when its option is on, so a disabled feature costs nothing per request. The minimal configuration is the one that shows it: upstream's five handlers still run, and ours runs one.

The chain figures are medians of three one-off runs of the same harness on one host, at 2000 iterations after warm-up, both sides reading `serverChain.fixture.ts`. Upstream's median is the upstream 2.6.0 handlers with its own defaults laid under the same options, so its default XSS validator runs under the app's options, as it would for an app that does not set it off. The ratio spans about 4 to 11 across the three runs under the app's options, and about 6.5 to 7.4 under the minimal one. The committed bench reports means and gates them; it does not record the medians.

Not comparable, or not measured:

- Allocations were not counted, so no figure of fewer allocations is claimed.
- The headers' native baseline differs between the two sides (their serializers differ), so only the full paths are compared, not their baselines.
- Both sides run on a stand-in event, not a live server: ours on the H3 v2 event shape, upstream's on a node response through h3 v1, with Nitro's runtime stood in for. Their own `h3` and `radix3` versions are the ones installed for each.
- The two sides order their SRI and nonce rewrites differently, so the rewrite figure is their total cost and not one step's.
