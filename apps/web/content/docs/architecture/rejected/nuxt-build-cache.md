---
title: Nuxt build cache
description: Rejected — Nuxt's experimental.buildCache to skip the Vue bundler on a CI app build already gated by a content-hash marker.
---

# Nuxt build cache

`experimental.buildCache` tars `.nuxt` under a hash of `srcDir/**` plus config and, on a hit, skips the Vue bundler outright.

## Why not

**It is the marker's shape, not an incremental one.** The app build is already gated by a [content-hash marker](/docs/architecture/monorepo-tooling) over every tracked file the build could read, and both invalidate on the same event — an app source edit. The only commits where they differ are those confined to `server/**` or `public/**`, which Nuxt's hash excludes; there it would skip the Vue bundle and still run Nitro.

**That sliver is bought against correctness.** A marker key that is wrong costs a rebuild. A tar restored against Nuxt's own hash of config objects ships a bundle that does not match the source, and says nothing about having done so.

**There is nothing underneath it.** `optimizeDeps` is the dev server's, and a production Rolldown build keeps no incremental state, so the bundler layer has no cache to enable at all.

## The revisit trigger

A commit shape confined to `server/**` becoming common enough to measure, **and** a key derived from tracked file content rather than from Nuxt's config hash.
