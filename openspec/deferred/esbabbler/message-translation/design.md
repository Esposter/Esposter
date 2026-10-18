# Message Translation

A per-message "Translate" action rendering an inline translation beneath the original.

**Why deferred:** requires a paid external translation API (Azure Translator or similar) — key management, per-character cost, rate limits — for a need that hasn't appeared in a mostly single-language community.

**Revisit when:** the community is measurably multilingual (foreign-language messages actually occur) and we accept an external API dependency (same bar as [/giphy](../giphy/design.md)).
