# nuxt-security-module

`packages/nuxt-security-module` is the replacement for [nuxt-security](https://github.com/Baroshem/nuxt-security), the Nuxt module that sets security headers, a nonce-based Content Security Policy, CORS, basic auth, a rate limiter, an XSS validator and a request size limiter. The app runs this package in place of the upstream. This section is the record the package was built against.

The decision to absorb it, and the rule a security-shaped absorption meets, are recorded in [dependency admission](../architecture/dependency-admission/design.md).

## Pages

- [Upstream audit](upstream/design.md) — every issue and pull request on the upstream repository, open and closed, with its verdict and the severity of any security defect.
- [Defaults review](defaults-review/design.md) — each header and option the module sets by default, its recommended value from the published sources, and a keep, change or remove verdict.

## Status

The package builds the headers, the nonce Content Security Policy, subresource integrity, the prerender policy, the header and CORS handlers, the allowed methods, basic auth, the request size limit, a rate limiter behind a store interface, CSRF by the double submit cookie, the route rules' `security` key and strict mode, and the `removeLoggers` option, which sets the bundler's `dropConsole`. Its module options are validated by one Zod schema per option group, so a bad option stops the build with its path. Each part has unit tests, and each in-scope audit defect that this code fixes has a regression test titled with its issue number. The package typechecks, lints and builds. Its Nitro plugins and middleware run inside the app, which registers the package in place of the upstream. A built app's rendered page carries the headers, a nonce that matches the Content Security Policy and integrity attributes that match their files, and no `X-Powered-By` header. The integrity attributes cover every file the build writes to its public directory, the client bundles included, so each `/_nuxt` script, stylesheet and preload link of the built check carries one that matches its served bytes.

Decided not to build, with the reason on the [upstream audit](upstream/design.md#decisions-not-built):

- The XSS validator is not built.

What is decided against is in [rejected](../../rejected/nuxt-security-module/), and what is deferred, with the trigger that reopens it, is in [deferred](../../deferred/nuxt-security-module/).

## Per-request cost

Each hot path is a benchmark beside its source, and each has a committed report of its means: the nonce, the headers, the route rules and the page rewrite in `packages/nuxt-security-module/src/runtime/nitro/plugins/` and `packages/nuxt-security-module/src/runtime/services/`, and the server chain in `packages/nuxt-security-module/src/runtime/server/middleware/`. The comparison with the upstream 2.6.0 ran once on the same host, over the same page of about sixty sections, with each path compared by its median. The figures are ratios and magnitudes, with the upstream's time over ours:

- **Applying the headers to a response** is about 6 times faster: a few microseconds against tens of microseconds. Upstream rebuilds each request's rules and writes its headers through its own helpers, where ours reads rules resolved once.
- **Rewriting a rendered page with its nonce and SRI attributes** is about 20 to 30 times faster. This is the largest gap, since upstream's two rewrites run as regular expressions over each section after masking its quoted attributes, and ours scan each tag once.
- **Resolving a request's route rules** is about 5 times faster: a few microseconds against tens of microseconds. Upstream builds its router and clones its route table for every request. Ours matches a table built once at startup and merges the matched rules only for the event.
- **Generating the nonce** is the same on both sides, a few microseconds each. The module does not claim a gain here.
- **The whole server chain** is about 7 times faster under both configurations. The chain is the handlers each module registers for a request to a page path, measured in `packages/nuxt-security-module/src/runtime/server/middleware/serverChain.bench.ts` with the app's options and with a minimal configuration that keeps only the request size limit. Upstream registers its server middlewares whatever the config says, and each one runs on every request, looks up the route's rules and returns early when its feature is off. Ours registers a handler only when its option is on, so a disabled feature costs nothing per request. The minimal configuration is the one that shows it: upstream's five handlers still run, and ours runs one.

The chain figures are medians of three one-off runs of the same harness on one host, at 2000 iterations after warm-up, both sides reading `serverChain.fixture.ts`. Upstream's median is the upstream 2.6.0 handlers with its own defaults laid under the same options, so its default XSS validator runs under the app's options, as it would for an app that does not set it off. The ratio varies widely across the three runs under the app's options, and sits near seven under the minimal one. The committed bench reports means and gates them; it does not record the medians.

Not comparable, or not measured:

- Allocations were not counted, so no figure of fewer allocations is claimed.
- The headers' native baseline differs between the two sides (their serializers differ), so only the full paths are compared, not their baselines.
- Both sides run on a stand-in event, not a live server: ours on the H3 v2 event shape, upstream's on a node response through h3 v1, with Nitro's runtime stood in for. Their own `h3` and `radix3` versions are the ones installed for each.
- The two sides order their SRI and nonce rewrites differently, so the rewrite figure is their total cost and not one step's.

## Options

The module's options are its own. Each is declared in `packages/nuxt-security-module/src/models/ModuleOptions.ts` and validated by one Zod schema per option group, and each default is written once, in `getDefaultModuleOptions` and `getDefaultSecurityHeaders`. A header's default and the source it rests on are in the [defaults review](defaults-review/design.md), which also holds the app's own overrides. The table gives the reason for each default that is a decision of the module rather than a header's value. The other options take the defaults `getDefaultModuleOptions` states.

| Option                     | Reason for its default                                                                                                                                                                                                                                                                      |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `allowedMethodsRestricter` | Off. A restricter with no method list refuses nothing, so a default-on one would only add per-request work.                                                                                                                                                                                 |
| `csrf`                     | Off. When on, it is the double submit cookie of the OWASP CSRF Prevention Cheat Sheet.                                                                                                                                                                                                      |
| `headers.xXSSProtection`   | Not sent. MDN records the header as non-standard and deprecated, and browsers have removed the auditor it configured, so its value does nothing. The serializer test pins it not sent.                                                                                                      |
| `rateLimiter`              | Off. A limiter keyed on a forwarded address the client can write is spoofable (the [upstream audit](upstream/design.md) records #83 and #196), and the app runs its own limiter, shared across instances ([security posture](../architecture/security-posture/design.md)).                  |
| `removeLoggers`            | Off. What an app logs is its own choice, and no OWASP, MDN or W3C source asks for console calls to be dropped.                                                                                                                                                                              |
| `requestSizeLimiter`       | The default limit is declared in `getDefaultModuleOptions`. A request claiming a `multipart/form-data` body gets no larger limit: the client writes that header, so a route that takes a larger body names its own limit in its route rule. The app sets its limit from `MAX_REQUEST_SIZE`. |
