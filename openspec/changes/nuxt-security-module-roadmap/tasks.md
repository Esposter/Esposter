# Nuxt security module roadmap

The open work of [nuxt-security-module](../../specs/nuxt-security-module/README.md). Each item names the page that holds its source, and its own change is written when it is picked up. Each item's verification is its nested sub-step.

## Next

- [x] Run the plugins in a Nuxt app, and check the headers, the nonce and the integrity attributes in a rendered page, including the `X-Powered-By` removal. Source: [the package's status](../../specs/nuxt-security-module/README.md#status).
  - Verify: the rendered page's response headers and its nonce and integrity attributes match the expected values, with the `X-Powered-By` header absent.
- [x] Verify the SRI behaviour on preload links (#655) and on entry import maps (#657) against a built app. Both are kept as they are until then. Source: [what our configuration triggers](../../specs/nuxt-security-module/upstream/design.md#what-our-configuration-triggers).
  - Verify: each issue is marked reproduced or not reproduced in the upstream audit's verdict table, with the built app as the evidence.
- [ ] Hash the client bundles and stylesheets the build writes, so the app's own scripts, stylesheets and preload links carry integrity attributes. The module computes its hashes before the client bundles exist. Source: [what our configuration triggers](../../specs/nuxt-security-module/upstream/design.md#what-our-configuration-triggers).
  - Verify: each `/_nuxt` script, stylesheet and preload link in a built app's rendered page carries an integrity attribute that matches its served bytes, and #655 is checked again on that page.

## Later

- [ ] Run each regression test against the upstream package, and confirm it fails there first, where the reproduction is cheap. Source: [fail-first results](../../specs/nuxt-security-module/upstream/design.md#fail-first-results).
  - Verify: each regression test is run against the installed upstream version, and the run is recorded in the fail-first results.
  - Status: the one test whose probe needs no Nitro app, #118, ran and passes on upstream, so it is recorded as fixed upstream. The other needs-app tests are not run against upstream, since their probes need a Nitro harness. Whether to build that harness is an owner decision.
  - Deferred to [openspec/deferred/nuxt-security-module/upstream-regression-harness/design.md](../../deferred/nuxt-security-module/upstream-regression-harness/design.md).
