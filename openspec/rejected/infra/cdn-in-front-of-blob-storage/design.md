# CDN in front of the asset buckets

The game's data is published as immutable, content-addressed objects in the app's public R2 bucket, `public-genshin-assets`, and the browser fetches each one once and then caches it ([hosted game data](../../../specs/genshin/hosted-game-data/design.md)). A CDN in front of that bucket would serve those objects from its own edge, so most reads would never reach storage.

**Why not:** the assets hosts already answer from Cloudflare's edge, through the web Worker's asset route, and immutable caching answers a repeat visit with no request, so a cache layer in front of the Worker would only save the Worker's read of a first visit's few hundred kilobytes. That layer would be one more set of cache rules and purge paths to keep in step with the content-addressed names that already make every object safe to cache forever. Adding one later changes only the hosts' configuration, so the decision can be revisited without touching the code.
