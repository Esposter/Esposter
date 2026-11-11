# Post Search

Searching posts by title/description text.

**Why deferred:** The feed is small enough to scroll. The platform's search is decided: the resource search tolerates typos on Postgres trigrams with no new service ([global search relevance](../../../specs/resource/global-search-relevance/design.md)), and message search runs on Azure AI Search, so a post's search would join the first as a source rather than build a third. That needs a posts group in the palette and a query over titles and descriptions, which a feed nobody has outgrown does not yet earn.

**Revisit when:** a reader has to scroll past a page of the feed to find a post they know exists, and the resource search's trigram query can take posts as a source.
