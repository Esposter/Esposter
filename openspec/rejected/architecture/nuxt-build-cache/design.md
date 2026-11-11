# Nuxt build cache

`experimental.buildCache` tars `.nuxt` under a hash of `srcDir/**` plus config and, on a hit, skips the Vue bundler outright.

## Why not

**It would be the only cache in front of the app build, and keyed on less than the build reads.** The app build runs on every push, and Nuxt's hash covers `srcDir/**` and its config, not the server code, the public files or the packages' built output the build also reads. A commit confined to `server/**` or `public/**` falls outside that hash, where a hit would skip the Vue bundle and still run Nitro.

**That sliver is bought against correctness.** A marker key that is wrong costs a rebuild. A tar restored against Nuxt's own hash of config objects ships a bundle that does not match the source, and says nothing about having done so.

**There is nothing underneath it.** `optimizeDeps` is the dev server's, and a production Rolldown build keeps no incremental state, so the bundler layer has no cache to enable at all.

## The revisit trigger

A commit shape confined to `server/**` becoming common enough to measure, **and** a key derived from tracked file content rather than from Nuxt's config hash.
