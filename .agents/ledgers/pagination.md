# Pagination

The three-layer cursor pattern, infinite scroll, the one search-as-you-type stack, bundled ancillary reads, and the offline list cache.

## The unpaged-list recipe

Every list pages by keyset (`openspec/specs/architecture/pagination/design.md`), so a list procedure that answers one capped read with no cursor is a finding unless the design names it as an exemption. A keyset page takes `limit + 1`, a single row takes `limit(1)`, and the rate limiter calls `.limit({`; the scan drops those three shapes and reads what is left.

```bash
git grep -nE "\.limit\(" -- apps/web/server/trpc packages/db/src/services/pagination ':!*.test.*' | grep -vE "limit\(1\)|limit \+ 1|\.limit\(\{"
```

A hit is a finding when the procedure answers its whole capped list with no `nextCursor`, and the design's exemption paragraph does not name it. A capped read the design does name is the one the design's exemption owns, and the owner decides whether a new one joins it: paging the list, or recording the cap, is a product choice, not a mechanical fix. The scan covers the routers and the pagination service only, so a capped read in `server/services` is outside this question's Scope.
