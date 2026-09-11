# Which Positions Check a Field Key

Read when an object key mirrors another schema's field — a `.pick()`/`.omit()` on a generic `z.ZodObject`, a `.safeExtend({ … })`, a plain `z.object({ field: src.shape.field })` — and deciding whether the key is a literal or the computed `[src.keyof().enum.field]`. This page holds the whole rule; `SKILL.md` keeps the one line that names the two unchecked positions.

An object key naming another schema's field is inherited where nothing else checks it. Which positions those are was measured, by mistyping a key in each and running typecheck — not reasoned about, because the answer is not what it looks like:

| Position                                             | A wrong key is                                      |
| ---------------------------------------------------- | --------------------------------------------------- |
| `.omit()` / `.pick()` on a **generic** `z.ZodObject` | **not caught** — compiles, omits nothing            |
| `.safeExtend({ … })`                                 | **not caught** — silently adds a field, layers none |
| `.pick()` / `.omit()` on a **concrete** schema       | caught at the site (`TS2561`)                       |
| a plain `z.object({ field: src.shape.field })`       | caught, but only downstream at every consumer       |
| `[src.keyof().enum.field]`                           | caught at the site (`TS2551`)                       |

So the computed key `[src.keyof().enum.field]: src.shape.field.optional()` is **required** in the first two rows and is the only guard those positions have — a resolver taking `schema: z.ZodObject` and a `*Form` schema layering `.meta()` onto a shared field are both in that set. Everywhere else a literal key is correct and the computed form is noise: `.pick()` already checks itself, and a plain `z.object` field is pinned by the consumers that destructure it. A key that **deliberately differs** from the source (`targetUserId: selectUserSchema.shape.id`) is never a candidate — it is not mirroring a name.
