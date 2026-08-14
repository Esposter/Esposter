# Single-Use Computeds

Carries the `vue` skill's "Computed for reused expressions — extract a `computed` when the same derived value binds to 2+ props; single-use values stay inline" across the components written before it. A `computed` read exactly once is ceremony: it costs a name, a `.value`, and a reader's trip up the file to find out that the expression is what the template already said.

Three things are **not** findings, and each has bitten a pass that read the rule alone:

- **A sort.** `.toSorted()` in the computed that feeds the template is its own rule in the same skill, and it stays even at one use.
- **A map lookup used once.** The rule there is the opposite direction — read `Map[type]` inline — so the finding is the computed, not its use count. Already covered by the same skill's "Map lookups over computed" line.
- **A getter called per `v-for` item.** Inlining a store getter into the item body calls it once per row rather than once per render. Leave it, or hoist it if the row count is unbounded.

Behaviour-preserving by construction: inlining a computed changes nothing a user can see, and anything that would is not this sweep's (a computed doing real memoization of an expensive derivation stays).

| Unit                                      | Swept | Notes                                                       |
| :---------------------------------------- | :---- | :---------------------------------------------------------- |
| `app/components/Message`                  | —     | Largest tree, and the one the rule was written against      |
| `app/components/Resource`                 | —     |                                                             |
| `app/components/Styled` + `App`           | —     | Primitives — a computed here often does bind twice          |
| `app/components` — the rest               | —     |                                                             |
| `app/pages` + `app/layouts`               | —     |                                                             |
| `app/composables`                         | —     | A returned computed is the composable's surface, not a find |
| `app/store`                               | —     | A store's computed is read by consumers it cannot count     |
| `packages/vue-phaserjs`, `packages/infra` | —     |                                                             |

## Find recipe

```bash
# every computed, with its identifier — the count of that identifier in the file is the signal
grep -rnE "const \w+ = computed" --include=*.vue --include=*.ts app |
  sed -E 's/^([^:]+):[0-9]+:const (\w+) = computed.*/\1 \2/' |
  while read -r file name; do
    [ "$(grep -c "\b$name\b" "$file")" -le 2 ] && echo "$file: $name"
  done
```

Two occurrences is the threshold: the declaration itself, plus its one use.

## Next enforceable

An oxlint rule cannot count template uses of a script binding today — the SFC's two halves are separate ASTs to it — so this stays a reading pass until oxlint's vue plugin can resolve a template identifier back to its declaration.
