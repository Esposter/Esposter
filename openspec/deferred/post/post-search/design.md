# Post Search

Searching posts by title/description text.

**Why deferred:** The feed is small enough to scroll. The platform's search is decided: resource search is one FTS5 table in D1 over names and tags, with no typo tolerance and no service behind it ([global search relevance](../../../specs/resource/global-search-relevance/design.md)), and message search is an FTS5 table inside each room's object. A post's search would join resource search as a source rather than build a third. That needs a posts group in the palette and a query over titles and descriptions, which a feed nobody has outgrown does not yet earn.

**Revisit when:** a reader has to scroll past a page of the feed to find a post they know exists, and the resource search's FTS5 query can take posts as a source.
