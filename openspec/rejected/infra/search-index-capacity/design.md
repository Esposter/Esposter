# Search index capacity

Message search ran on Azure AI Search, on its Free SKU, and this record weighed paying for a larger tier once the Free SKU's index count and storage ceiling were reached. The [Cloudflare program](../../../changes/infra-cloudflare-program/design.md) retires that service, and with it the capacity question.

**Why not:** Message search is an FTS5 table inside each room's object, written in the same transaction as the message ([Cloudflare services](../../../specs/architecture/cloudflare-services/design.md)), so there is no index tier to outgrow, no scheduled indexer whose failed runs can leave new messages out of search, and no second service to pay for. Resource search has no separate service either: it is one FTS5 table in D1 ([global search relevance](../../../specs/resource/global-search-relevance/design.md)).
