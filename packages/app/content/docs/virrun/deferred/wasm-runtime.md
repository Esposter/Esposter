---
title: WASM runtime backend
description: A WebContainers-style backend — Node compiled to WASM, zero host setup, fully cross-platform, no native addons.
---

# WASM runtime backend

A WebContainers-style backend: Node compiled to WASM running in-process/in-browser, so `pnpm install` and JS toolchains run with zero host setup, fully cross-platform.

**Why deferred:** It does not meet the generic-any-repo goal: WASM Node runs no **native** binaries (sharp, esbuild native, anything with a node-gyp addon) and is meaningfully CPU-slower. The `os` backend is the path to real native support and is the priority; a third backend splits effort.

**Revisit when:** The `vfs` and `os` backends are stable **and** there is concrete demand for a browser-only or zero-host-setup target (in-browser playground, untrusted client-side execution) where the no-native limitation is acceptable.

**Cheaper interim:** The `vfs` backend already covers in-process pure-JS runs cross-platform without WASM. For browser specifically, `@webcontainer/api` can be used directly rather than rebuilt.
