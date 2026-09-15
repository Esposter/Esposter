# Numeric constraints

Read when adding a numeric field — which constraint its domain earns, and the Zod 4 spelling of each. The rule that every field carries the tightest constraint its domain allows is in `SKILL.md`.

Every field carries the tightest constraint its domain allows — a bare `z.number()` / `z.string()` is only correct when the value is genuinely unbounded. Audit each numeric field against what it models, in the app and in `packages/*` libraries alike:

- Count / quantity / index / byte size (whole, ≥ 0) → `z.int().nonnegative()`; a count that can't be zero (frequency, sample count) → `z.int().positive()`.
- Price / rate / duration / timestamp (fractional, ≥ 0) → `z.number().nonnegative()`; one that can't be zero (price, multiplier) → `z.number().positive()`.
- Percentage → `z.number().min(0).max(100)`.
- Genuinely signed value (deltas, statistical `average`/`minimum`/`maximum`/`summation`, coordinates) → leave `z.number()` bare.

Rules:

- **Integers use `z.int()`**, never `z.number().int()` (Zod 4) and never plain `z.number()` when the value is whole by definition (counts, indices, byte sizes).
- **≥ 0 is `.nonnegative()`, > 0 is `.positive()`** — never `.min(0)` / `.min(1)` for these; reserve `.min(N)` for a domain-specific lower bound (usually paired with an upper).
- **Check the seed/fixture data** before choosing — if every real value is strictly positive (prices, effect multipliers), use `.positive()`, not the weaker `.nonnegative()`.
