# CDN in front of Railway

A CDN in front of the app would proxy `esposter.com`, cache the build assets at its edge and send them from there, so most of the app's egress would never reach its host.

The [Cloudflare program](../../../changes/infra-cloudflare-program/design.md) leaves Railway, the host this record's cost reasoning was argued from, so that reasoning no longer holds. The rest of the reasoning still does.

**Why not:** A CDN is a second service to run. It takes over the domain's DNS, TLS and cache rules, and each of those is a place where the app and the proxy can disagree about what is served. Most of the egress such a CDN would save comes from the app compressing its own assets, which needs no second service ([compression](../../../specs/architecture/compression/design.md)). Hosting cost is cut inside the host and inside this repository, never by adding a service. Every added service is one more thing to maintain and one more source of churn.
