---
title: Resource Tags
description: Azure tag parity — name:value pairs on every resource, shown in Essentials, editable in place, filterable on the list.
---

# Resource Tags

Azure tag parity: name:value pairs on every resource, shown in Essentials, editable in place, filterable on `/resources/all`. Azure tags are `Record<string, string>` metadata — the lightweight organization layer that keeps [resource groups deferred](/docs/platform/deferred/resource-groups): cross-cutting labels without a grouping entity.

## Data model

- `resources.tags`: `jsonb` `Record<string, string>`, `notNull().default({})`, GIN index for containment queries.
- Zod: `resourceTagsSchema` — record with `MAX_TAGS_COUNT` entries, `MAX_TAG_NAME_LENGTH` / `MAX_TAG_VALUE_LENGTH` (named constants per convention), names non-empty via the `normalizeString` pipe.

## Procedures

| Procedure                          | Auth   | Input                             | Purpose                                                        |
| ---------------------------------- | ------ | --------------------------------- | -------------------------------------------------------------- |
| `<type>.updateResource` (factory)  | owner  | + `tags?`                         | replace-whole-record update (Azure semantics)                  |
| `resource.readResources` / `count` | authed | + `tags?: Record<string, string>` | containment filter (`tags @> input`) in `createResourcesWhere` |

## Flow

```mermaid
flowchart LR
  DLG["TagsEditorDialog<br/>(name/value rows)"] -->|"updateResource { tags } — whole-record replace"| COL[("resources.tags jsonb<br/>+ GIN index")]
  COL --> ESS["Essentials tags row (chips)"]
  PILL["/all Tag filter pill"] -->|"tags @> input"| WHERE["createResourcesWhere"] --> LIST["/all list + count"]
  COL --> WHERE
```

## Components

- Essentials gains a **Tags** row: `{name}: {value}` chips + an Edit link opening a tag editor dialog (rows of name/value fields, add/remove)
- `/all` filter pill **Tag** ([list filters & views](/docs/proposals/platform/list-filters-and-views)): name + optional value; tag chips could later render as an opt-in column via the column chooser

## Key files

| File                                           | Role                  |
| ---------------------------------------------- | --------------------- |
| `packages/db-schema/src/schema/resources.ts`   | `tags` column + index |
| `app/components/Resource/TagsEditorDialog.vue` | name/value editor     |
| `app/components/Resource/Overview.vue`         | Essentials tags row   |

## Notes

- Flat name:value only (faithful to Azure) — no hierarchies, no typed values.
- Free-text tag search inside global search is out of the first cut; the `/all` filter pill is the retrieval path. Revisit alongside `pg_trgm`.
- If tag usage grows into "give me a folder", that is the [resource groups](/docs/platform/deferred/resource-groups) revisit trigger, not more tag features.
