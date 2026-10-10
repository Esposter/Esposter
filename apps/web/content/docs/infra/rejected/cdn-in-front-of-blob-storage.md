---
title: CDN in front of Blob storage
description: Putting Azure Front Door or another CDN in front of the Blob account that serves the game's data, so its immutable objects are cached at the edge instead of read from storage.
---

# CDN in front of Blob storage

The game's character profiles and book bodies are published as immutable, content-addressed objects in the app's public Blob container, and the browser fetches each one once and then caches it ([hosted game data](/docs/genshin/hosted-game-data)); the rest of the game's data is [proposed](/docs/proposals/genshin/hosted-game-data) to follow. A CDN in front of that account would serve those objects from its own edge, so most reads would never reach storage.

**Why not:** immutable caching already answers a repeat visit with no request, and a first visit reads a few hundred kilobytes, so a CDN buys little on the browser side. Its cost is a monthly base fee plus a per-GB rate on every byte it serves: Azure Front Door Standard charges a $35 base fee and $0.0825 per GB out at zone 1 for the first 10 TB a month. Blob storage is cheaper at this app's volume, since its egress is free for the first 100 GB a month and then $0.12 per GB, and the stored data costs under a cent a month: Front Door's lower per-GB rate repays its base fee only past about 1.25 TB a month counting egress alone, and further out once its per-request charge is added. A CDN would also be a second service with its own domain, cache rules and failure mode, the trade the [CDN in front of Railway](/docs/infra/rejected/cdn-in-front-of-railway) page already refuses. Adding one later would change only the base URL the browser reads, so the decision can be revisited then without touching the code.

## Sources

- [Azure Retail Prices API](https://prices.azure.com/api/retail/prices) — queried for the Azure Front Door Service on the Standard SKU of the `Azure Front Door` product (the `Azure Front Door Service` product's $0.17 is Classic's), for its monthly base fee and its data transfer out per GB at zone 1, and for the Bandwidth service in `australiaeast`, for the first 100 GB free and then the per-GB rate.
