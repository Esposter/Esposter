# Tag Search in Global Search

## Why

Global search matches resource names only. The tags spec says so as an open gap: free-text tag search inside global search is not wired up, and tags are reached through the `/all` filter pill and the tags list instead. An owner who remembers a label, such as `environment: production`, and not the resource's name cannot find it from the palette. The resource roadmap does not name this gap. It is gap 10 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## What Changes

A search matches a resource whose tag name or tag value contains the query, case-insensitively, as well as a resource whose name does.

- The match runs in the same search predicate as the name match, so the palette's Resources group, the `/all` list opened by See all results, and the count all agree.
- A resource matched only by a tag ranks below every resource matched by its name. Within the tag matches, newest first.
- The query's wildcard characters match only themselves, as they already do for names.
- No index and no migration. The tag match scans the owner's own rows, which the owner filter already bounds.
- **Capabilities:** `resource/global-search` (modified), `resource/global-search-relevance` (modified).

## Capabilities

- **resource/global-search** (modified): a requirement for matching by tags.
- **resource/global-search-relevance** (modified): a requirement for where a tag-only match ranks.

## Waiting on

None. Global search and its relevance ladder are built.

## Impact

- The search predicate, which gains the tag arm, and the ordering of the list, which gains a name-substring tier.
- The tags spec's Notes sentence saying tag search is not wired up is removed when this ships, and the global-search and relevance pages describe the match they now do.
