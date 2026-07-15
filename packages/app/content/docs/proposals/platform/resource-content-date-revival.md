---
title: Resource Content Date Revival
description: jsonDateParse revives ISO datetime strings inside resource content into Dates, which columnValueSchema then rejects — a Sheet cell holding an ISO datetime fails to read.
---

# Resource Content Date Revival

`readResourceContent` runs `jsonDateParse` over the whole content blob before validating it. `jsonDateParse` revives **any** string matching a full ISO datetime into a `Date`, with no notion of which fields are supposed to be dates. Sheet cell values are typed `boolean | null | number | string` — a revived `Date` is none of those, so the schema parse throws and the resource fails to load.

## The mechanism

`server/services/resource/readResourceContent.ts:26`:

```ts
return contentSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
```

`packages/shared/src/util/object/jsonDateParse.ts` reviver, applied to every string in the payload:

```ts
if (typeof value === "string") {
  let a = ISO_DATE_REGEX.exec(value);
  if (a) parsedValue = new Date(value);
```

`shared/models/resource/sheet/column/ColumnValue.ts`:

```ts
export type ColumnValue = boolean | null | number | string;
```

So the round-trip is: cell holds `"2026-07-15T09:00:00Z"` → written to the blob as a JSON string → read back and revived to `Date` → `columnValueSchema` rejects it → `contentSchema.parse` throws → the read is a 500, not a bad cell.

## Trigger

`ISO_DATE_REGEX` requires the time component (`YYYY-MM-DDTHH:mm:ss` with optional fraction and `Z`/offset). Date-only strings like `"2026-07-15"` do **not** match and are safe. So the trigger is any Sheet cell whose text is a full ISO datetime — typed by a user, imported from a CSV/JSON export, or written by a dataset provider that emits timestamps. A Survey date question bound to a published dashboard is one path to it, but it is not the only one; the same failure reaches a plain hand-typed cell.

The survey funnel worked around its own path with a date-only string helper (`shared/services/dayjs/getUtcDateString.ts`), which avoids emitting a matching string. That fixes one producer, not the class.

## Verify first

Reproduce before fixing — write a Sheet with a cell containing `2026-07-15T09:00:00Z`, save, and read it back through `readResourceContent`. Confirm the throw and capture what the user actually sees (500 vs. empty blade). Check the other `jsonDateParse` callers for the same shape while there: `readSheetDataset.ts`, `deserializeJson.ts`, `readClicker`/`readDungeons` save payloads, `getDraft.ts`, and the `customPayloads` plugin.

## Options

1. **Don't revive inside content** — drop `jsonDateParse` from `readResourceContent` and use plain `JSON.parse`, letting each content schema opt into date coercion (`z.coerce.date()`) on the fields that are genuinely dates. Resource content is schema-validated, so the schema already knows which fields are dates; blanket revival is guessing. This is the preferred direction.
2. **Accept `Date` in `columnValueSchema`** — wrong shape: it widens the cell type across the whole sheet editor to paper over a reviver that should not have fired.
3. **Narrow the reviver by key** — needs a key allowlist per schema, which is the same information option 1 gets from the schema for free.

## Checklist

- [ ] Reproduce with an ISO-datetime Sheet cell and record the user-visible symptom
- [ ] Audit the other `jsonDateParse` call sites for the same over-revival
- [ ] Replace blanket revival in `readResourceContent` with schema-level date coercion
- [ ] Regression test: a Sheet cell holding an ISO datetime round-trips as a string
