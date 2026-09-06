# Composite Keys

Read when joining more than one identifier into a single string — a `useMutation` key over a pair, a
`useDataMap` slice key, a rendered `:key`, a list item id, a browser-storage key, or a blob name.

## One separator for every in-memory key

A composite key is joined with `ID_SEPARATOR` (`@esposter/shared`), never a hand-written `-` or `:`:

```typescript
`${roomId}${ID_SEPARATOR}${userId}`;
```

One constant covers every composite string in the repo, keys and blob names alike. The separator is `|` for two
reasons that both have to hold: uuids contain hyphens, so a hyphenated key cannot be split back into its parts —
which is exactly what the drafts page does with a composer key — and a colon is rejected in a Windows path,
which the blob names reach.

**Keys parsed back apart split on the first separator only**, so an id that may itself contain one goes last.

## A url or persisted format keeps its own named separator

One per format — a query parameter's, a browser-storage key's. Those strings live in saved links and in stored
data, so they carry a compatibility contract an in-memory key does not, and the two have to stay free to diverge.

Named either way: the rule being enforced is that no separator is a bare literal at its use site. The reason
lives here rather than beside each constant, whose name already says which format it serves.

## Segments are existing enum values, never hand-spelled names

`AsyncDataKey.ReadPosts` composes `Operation.Read` + `DatabaseEntityType.Post` + what scopes it. A
`` `read-posts:${…}` `` invents a second spelling of two things the repo already names, and nothing renames with
them.

Reach for `Operation`, `DatabaseEntityType`/`DerivedDatabaseEntityType`, `ResourceType` and the feature's own
enum before typing any segment as text.
