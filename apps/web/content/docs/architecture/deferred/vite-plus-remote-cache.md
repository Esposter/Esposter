---
title: Vite+ remote cache
description: Deferred — sharing the `vp` task cache through a remote endpoint instead of carrying it across CI runs with `actions/cache`.
---

# Vite+ Remote Cache

The task cache crosses CI runs through `actions/cache`, restored by key prefix after the install ([monorepo tooling](/docs/architecture/monorepo-tooling)). A remote cache would share it through an endpoint instead, and between machines as well as runs.

`vite-task` has merged a client — an endpoint named by `cache: { remote: { url } }` or `VP_REMOTE_CACHE_URL`, read by default, written with `--remote-cache=read-write`, uploads authenticated by a GitHub Actions OIDC token ([changelog](https://github.com/voidzero-dev/vite-task/blob/main/CHANGELOG.md)). But the `vite-task` revision `vite-plus` 1.0.0 pins predates it, and upstream ships no server: its server API is a [draft design](https://github.com/voidzero-dev/vite-task/pull/713), so the endpoint would be ours to host against a specification that may still change.

## Revisit when

A `vite-plus` release pins a `vite-task` carrying the client, and either upstream hosts a server or its server API is merged as a contract an endpoint of ours could implement.
