# Browser boundary

| Unit                                         | Swept      | Notes                                                       |
| :------------------------------------------- | :--------- | :---------------------------------------------------------- |
| `app/services`, `app/util`                   | 2026-08-26 | draft services replaced by `draftsSerializer`               |
| `app/store`                                  | 2026-08-26 | `message/input` — the Map is the storage; three guards gone |
| `app/composables`                            | 2026-08-26 | survey converted; the offline save system is the exception  |
| `app/components`, `app/pages`, `app/plugins` | 2026-08-26 | two conversions; the rest is phases and one genuine fork    |
| `app/middleware`, `app/layouts`              | 2026-08-26 | clean — the only browser reach is a `.client.ts` middleware |

Rules: `/docs/architecture/browser-execution`. Greps, per unit:

1. `window\.localStorage` — already a `no-restricted-syntax` error, so this only finds a disable that has outlived
   its reason.
2. `checkIsServer` — the one that still needs reading. A hit is either a genuine fork (both branches real, keep) or a
   leaf that has already been answered by a ref or a phase (convert). The count at the sweep's opening was 30.
3. `window\.` over `app/` — the wider class: `document`, `navigator`, `matchMedia`. Its deterministic half is now
   the enforcer's, so what this grep is for is the rest. A read at module scope is a `no-restricted-syntax` error,
   because that position is provably before any phase; inside a function it may or may not be, and only reading
   says which. The two shapes to look for, both of which this pass found: a call at a **setup root**, and a call
   inside a **computed**, which survives SSR only while nothing reads the computed during the server render.

**Standing exception**: the offline save system — `composables/clicker/useReadClicker.ts`,
`composables/dungeons/useReadDungeons.ts`, `composables/shared/useSaveToLocalStorage.ts`. The key is a parameter to a
validating writer, so no ref owns it, and the reads are already inside `useReadData`'s `onMounted`. Converting it
means restructuring the save path, which is its own change rather than part of a sweep; until then the three lines
carry a disable naming this row.

Retire this ledger when grep 2 finds nothing but genuine forks — the enforcer already owns grep 1 and the module-scope
half of grep 3, and a sweep whose whole scope becomes enforceable is deleted rather than maintained.
