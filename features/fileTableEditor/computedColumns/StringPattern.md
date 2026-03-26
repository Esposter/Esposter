# StringPattern Transformation

## Shape

Extends `WithSourceColumnIds`.

```typescript
{ type: StringPattern, sourceColumnIds: string[], pattern: string }
// pattern: "{0} {1}" — positional refs into sourceColumnIds
// e.g. sourceColumnIds: [firstNameId, lastNameId], pattern: "{0} {1}" → "Jane Smith"
```

Zod `.refine()` validates that every `{N}` index referenced in the pattern is within `sourceColumnIds` bounds.

---

## Evaluation

```typescript
computeStringPatternTransformation(values: ColumnValue[], pattern: string): ColumnValue
// Substitutes each {N} token with String(values[N])
```

`resolveValue` resolves all `sourceColumnIds` into a `ColumnValue[]` array, then passes to the evaluator. Each resolved value goes through the same recursive `resolveValue` path — chained computed columns work transparently.

---

## `PatternInput.vue` — UI Component

A `contenteditable` div wrapped in `v-field` (provides Vuetify label, border, and density without reimplementing them). The underlying text content always stays as the raw pattern string — `{N}` tokens are never replaced with DOM nodes.

### Chip rendering

On every `input` event:

1. Save cursor position via `Selection` / `Range` API
2. Walk text nodes, wrap each `\{(\d+)\}` match in `<span class="pattern-chip">` displaying the matching column name from `sourceColumnIds[N]`
3. Restore cursor position

### Backspace behaviour

Backspace removes `}` → `{0` no longer matches the pattern → chip span disappears on the next render pass. No special `keydown` handling needed. The text underneath is always the raw `{0}` string, so partial deletion naturally reverts a chip to text.

### Label sync

The `sourceColumnIds` ordered list (rendered above the input as a multi-column selector) drives chip label text. Reordering or renaming a column in the list triggers the same re-render, updating all chip labels immediately.

### Model

`pattern: string` — serialized as-is. No intermediate structured format; the raw string is the source of truth.
