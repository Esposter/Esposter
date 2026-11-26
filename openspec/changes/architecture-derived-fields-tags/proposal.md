# Derived field declarations

## Intent

Every server-derived column states its kind, its inputs and its prediction on its own line, and the derived set, the row types and the overlay's patch check are all read from those lines.

## Why

The derived columns are known only by convention today. The count columns, the ranking, the inherited copies and the event counters each carry no mark, so nothing can list them, type them or refuse a write to them.

## What changes

- A declaration helper, beside each column's definition, naming its kind, inputs and prediction.
- A generated set of every declared column, read by the later changes.
- Readonly derived keys on the row types, and derived keys left out of drafts and patches.
- A runtime refusal of a patch to a derived key in the overlay.
- The classification of every candidate column the program's inventory lists, against its writer.

## Capabilities

- `architecture/derived-fields`, new: the declaration, the generated set, the types and the overlay check.

Nothing is BREAKING. No stored shape changes, and no caller's behaviour changes, since this change only declares what the columns already are.

## Order

This is the first of the program's four changes. The [design](design.md) states how the declarations are read, and what the later changes build on them.
