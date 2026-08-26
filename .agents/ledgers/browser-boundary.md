# Browser boundary

| Unit                                         | Swept      | Notes                                                       |
| :------------------------------------------- | :--------- | :---------------------------------------------------------- |
| `app/services`, `app/util`                   | 2026-08-26 | draft services replaced by `draftsSerializer`               |
| `app/store`                                  | 2026-08-26 | `message/input` — the Map is the storage; three guards gone |
| `app/composables`                            | 2026-08-26 | survey converted; the offline save system is the exception  |
| `app/components`, `app/pages`, `app/plugins` |            |                                                             |
| `app/middleware`, `app/layouts`              |            |                                                             |

Rules: `/docs/architecture/browser-execution`. Greps, per unit:

1. `window\.localStorage` — already a `no-restricted-syntax` error, so this only finds a disable that has outlived
   its reason.
2. `getIsServer` — the one that still needs reading. A hit is either a genuine fork (both branches real, keep) or a
   leaf that has already been answered by a ref or a phase (convert). The count at the sweep's opening was 30.
3. `window\.` over `app/` — the wider class the enforcer does not cover: `document`, `navigator`, `matchMedia`. Each
   is asked the same question the page asks, and the answer is usually a phase rather than a guard.

**Standing exception**: the offline save system — `composables/clicker/useReadClicker.ts`,
`composables/dungeons/useReadDungeons.ts`, `composables/shared/useSaveToLocalStorage.ts`. The key is a parameter to a
validating writer, so no ref owns it, and the reads are already inside `useReadData`'s `onMounted`. Converting it
means restructuring the save path, which is its own change rather than part of a sweep; until then the three lines
carry a disable naming this row.

Retire this ledger when grep 2 finds nothing but genuine forks — the enforcer already owns grep 1, and a sweep whose
whole scope becomes enforceable is deleted rather than maintained.
