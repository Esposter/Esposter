# Vize compiler

## Why

Deferred — replacing the Vue single-file compiler with Vize, a Rust-based Vue toolchain. Nuxt compiles the app through `@vitejs/plugin-vue`, and the library builds and Vitest compile through `unplugin-vue`. Vize's Nuxt module was tried in the app and taken back out. Its Vite plugin was read but never run in the repo.

## What Changes

Nothing yet: this idea is deferred. Its blockers and revisit trigger are in `design.md`. Reviving it moves this folder into `openspec/changes/`.
