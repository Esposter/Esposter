# Rustwright

## Why

Deferred — replacing Playwright with Rustwright, a Rust engine that drives Chromium over the DevTools protocol behind Playwright's own API. Playwright drives the repo's Genshin parity tooling and, through Vitest's browser provider, every browser test suite. Rustwright's reported gains are less memory and a faster start with no driver subprocess, but its Node binding bridges a small part of the API and no Vitest provider exists for it. The repo's use of Playwright goes well past that part, so a replacement has nothing to run on yet. A trial against the released Node binding found the exact gaps, which are in `design.md`.

## What Changes

Nothing yet: this idea is deferred. Its blockers, the order a replacement would take and the revisit trigger are in `design.md`. Reviving it moves this folder into `openspec/changes/`.
