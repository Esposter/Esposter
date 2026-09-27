---
title: CDN in front of Railway
description: Putting Cloudflare or another CDN between visitors and the Railway-hosted app to cut egress and serve cached assets from the edge.
---

# CDN in front of Railway

The app is served straight from Railway, and Railway bills every byte it sends out. A CDN in front of it would proxy `esposter.com`, cache the build assets at its edge and send them from there, so most of the egress would leave Railway's bill.

**Why not:** A CDN is a second service to run. It takes over the domain's DNS, TLS and cache rules, and each of those is a place where the app and the proxy can disagree about what is served. The egress it would save is a small fraction of the Railway bill, and most of that saving comes from the app compressing its own assets, which needs no second service ([compression](/docs/architecture/compression)). Hosting cost is cut inside Railway and inside this repository, never by adding a service. Every added service is one more thing to maintain and one more source of churn.

## Sources

- [Railway pricing](https://railway.com/pricing) — egress is billed per gigabyte on every plan.
