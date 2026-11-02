# content-mapper: a declaration that uses a generic type alias in a generic component is also written at module scope, where nothing reads it, so `noUnusedLocals` reports TS6196

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`. This issue comes from the first step, the type check, and is one of a few I ran into. A first run of this check on the app reported 103 diagnostics that `vue-tsc` does not report. The twelve issues of the first batch are closed, and a run on `vize` 0.652.0 reports 15. This issue explains some of those 15.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

A generic component declares `type Foo = { value: TBaz }` and `interface Bar { items: Foo[] }`, and passes `Bar` to `defineProps`. With `noUnusedLocals`, the mapper reports `'Bar' is declared but never used.` `vue-tsc` reports nothing.

This is the component's own props interface, so every file with this shape fails. It is a follow-up to the closed #11360. The reproduction of #11360 passes on 0.650.0, because its `defineProps` type is written inline. A declaration that refers to the alias is the missing case.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux. Source of truth: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which reports no diagnostic for the reproduction. The reproduction below gives the same diagnostics, at the same positions, on `vize` 0.652.0 (macOS on Apple silicon), and `vue-tsc` reports none.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.650.0",
    "vue": "3.5.44",
    "vue-tsc": "3.3.11"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.vue"]
}
```

`src/Probe.vue`:

```vue
<script setup lang="ts" generic="TBaz">
type Foo = { value: TBaz };

interface Bar {
  items: Foo[];
}
defineProps<Bar>();
</script>

<template>
  <div />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(4,11): error TS6196: 'Bar' is declared but never used.
```

The position is the `interface Bar` line in the source file. `vize check --show-virtual-ts` shows two copies of `Bar` in the generated code. The first is at module scope, after `Foo`. The second is inside `__setup`:

```ts
type Foo<TBaz = any> = { value: TBaz };
interface Bar {
  items: Foo[];
}
type $HoistedGeneric0<TBaz = any> = Foo<TBaz>;
// …
function __setup<TBaz>() {
  type Foo = $HoistedGeneric0<TBaz>;
  interface Bar {
  items: Foo[];
}
// …
  defineProps<Bar>();
```

Only the copy in `__setup` is read.

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file. A line `const bad: number = "x";` after `defineProps<Bar>();` gives `src/Probe.vue(8,7): error TS2322: Type 'string' is not assignable to type 'number'.` in both tools. Without `noUnusedLocals`, `tsrs` also reports nothing for the reproduction.

## Cause

The cause is: a declaration that depends on a generic alias goes to module scope and to `__setup`, and only the copy in `__setup` has a reader.

`module_spans` puts every hoisted type declaration at module scope (`crates/vize_canon/src/virtual_ts/generator/script_blocks.rs:110`):

```rust
if export.hoisted && !self.shadows_classic_name(export, script) {
    spans.push((export.start, export.end));
}
```

`HoistedGenericAliases` collects the declarations that depend on a generic alias as `dependent_declarations` (`crates/vize_canon/src/virtual_ts/generator/generics.rs:107`). It writes them again inside `__setup` (`generics.rs:145`):

```rust
for declaration in &self.dependent_declarations {
    append!(*ts, "  {declaration}\n");
}
```

Nothing removes them from the module-scope spans. The alias `Foo` keeps its module-scope copy for a reason: `$HoistedGeneric0` reads it. A dependent declaration has no such reader, so TypeScript reports it. When a dependent declaration is another dependent's input (`type Baz = Foo[]` and `interface Bar { items: Baz }`), only the last one is reported, because the module-scope copy of the next one reads the first.

A run confirmed the cause. `vize check --save-virtual-ts-for` wrote the generated file. `tsrs` on that file with `noUnusedLocals` reports TS6196 for the module-scope `Bar`. After the module-scope `interface Bar { … }` is deleted from that file, TS6196 for `Bar` is gone.

The fix is likely to leave the declarations in `dependent_declarations` out of `module_spans`.

## Real occurrence

https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Ui/List/Index.vue#L10

## Isolation

One change at a time from the reproduction, on `vize` 0.650.0 unless the row says otherwise.

| Change                                                                           | `tsrs`           | `vue-tsc` |
| :------------------------------------------------------------------------------- | :--------------- | :-------- |
| none                                                                             | TS6196 for `Bar` | none      |
| `noUnusedLocals` removed from `tsconfig.json`                                    | none             | none      |
| `type Bar = { items: Foo[] }` in place of the interface                          | TS6196 for `Bar` | none      |
| `generic="TBaz extends string"` in place of `generic="TBaz"`                     | TS6196 for `Bar` | none      |
| `defineProps<{ items: Foo[] }>()` in place of `Bar` (the shape of #11360)        | none             | none      |
| `Foo` is `{ value: string }`, and `Bar` has `baz: TBaz`                          | none             | none      |
| `Bar` is `{ items: { value: TBaz }[] }`, with no `Foo`                           | none             | none      |
| `Bar` is read by `defineEmits<{ pick: [bar: Bar] }>()` in place of `defineProps` | TS6196 for `Bar` | none      |
| `type Bar = Foo[]` read by `defineProps<{ items: Bar }>()`                       | TS6196 for `Bar` | none      |
| the component is not generic                                                     | none             | none      |
| `vize` 0.638.0, 0.645.0 or 0.651.0                                               | TS6196 for `Bar` | none      |

The trigger is a generic component, a type alias that names a generic parameter, and a second declaration that names that alias. The name `Props` and the macro do not matter. This is not a regression: 0.638.0 gives the same result.

## Not known

The fix is read from the source and not applied. The confirming run removed the module-scope copy by hand in the generated file. The `main` branch has the same code at the same lines. It was read and not run. `vize` 0.651.0 gives the same result as 0.650.0.

## Not a duplicate of

Searched open and closed issues and pull requests for TS6196, hoisted declarations, generic aliases and `Props`. The search matches words, not meaning.

- #11360 (closed): an alias in a generic component is declared again at module scope with its default type argument. The fix keeps the type parameter inside `__setup`, and that is where the second copy of the dependent declaration comes from. The reproduction of #11360 has no declaration that uses the alias.
- #11379 and #11383 (merged): keep the generic slot types and shared declaration aliases. #11383 removes unread aliases in a different path (the aliases for a repeated component use).
- #11365 (closed): TS6196 for the aliases of a second component use under `--declaration`. A different generated name and a different path.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
