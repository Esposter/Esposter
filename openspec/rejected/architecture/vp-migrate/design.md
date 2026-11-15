# vp migrate

Running `vp migrate` to move the repository onto Vite+'s own project layout, its configuration and its imports.

## Why not

It is ruled out on three counts, any one enough. It migrates a monorepo only from the workspace root, rewriting the shared package-manager configuration and the lockfile at once. It rewrites `vite` imports to `vite-plus` in config entry files and `vitest` imports to `vite-plus/test` in every package that does not declare `@nuxt/test-utils`. And it merges every tool's config into one generated `vite.config.ts`, where this repository keeps each tool's settings in a module of its own. It has no documented meta-framework handling either.
