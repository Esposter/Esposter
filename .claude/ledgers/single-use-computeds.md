# Single-Use Computeds

Carries the `vue` skill's "Computed for reused expressions" rule across the components written before it. That rule owns what counts as a finding, including the three shapes that are not one; read it before a pass.

Behaviour-preserving by construction: inlining a single-use computed changes nothing a user can see.

| Unit                                      | Swept      | Notes                                                       |
| :---------------------------------------- | :--------- | :---------------------------------------------------------- |
| `app/components/Message`                  | 2026-08-15 | Sharpened the inline-vs-keep test into the owning rule      |
| `app/components/Resource`                 | —          |                                                             |
| `app/components/Styled` + `App`           | —          | Primitives — a computed here often does bind twice          |
| `app/components` — the rest               | —          |                                                             |
| `app/pages` + `app/layouts`               | —          |                                                             |
| `app/composables`                         | —          | A returned computed is the composable's surface, not a find |
| `app/store`                               | —          | A store's computed is read by consumers it cannot count     |
| `packages/vue-phaserjs`, `packages/infra` | —          |                                                             |

## Find recipe

From the repository root, over every tree the coverage table lists:

```bash
# every computed, with its identifier — the count of that identifier in the file is the signal
grep -rnE "const \w+ = computed" --include=*.vue --include=*.ts \
  packages/app/app packages/vue-phaserjs packages/infra |
  sed -E 's/^([^:]+):[0-9]+:const (\w+) = computed.*/\1 \2/' |
  while read -r file name; do
    # A shorthand binding spells the name in kebab-case (`:excluded-user-ids`), so both forms count as uses —
    # Matching the camelCase identifier alone scores those files as having no use at all
    kebab="$(echo "$name" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')"
    # -o, because two bindings on one line are two uses and `grep -c` would score them as one
    [ "$(grep -owE "$name|$kebab" "$file" | wc -l)" -le 2 ] && echo "$file: $name"
  done
```

Two occurrences is the threshold: the declaration itself, plus its one use.

## Next enforceable

An oxlint rule cannot count template uses of a script binding today — the SFC's two halves are separate ASTs to it — so this stays a reading pass until oxlint's vue plugin can resolve a template identifier back to its declaration.
