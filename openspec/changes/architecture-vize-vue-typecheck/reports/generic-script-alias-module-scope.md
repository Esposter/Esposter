# content-mapper: a type alias in a generic component's script is re-declared at module scope with its default type argument, so a slot payload loses the generic

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A generic component declares `type Foo = TExtra & { bar: string }` and uses it in `defineSlots`. A parent that reads the slot payload sees `Foo` with `TExtra` replaced by its default. `vue-tsc` keeps the generic.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, the repository's pinned Node, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.638.0",
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
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.vue"]
}
```

`src/Child.vue`:

```vue
<script setup lang="ts" generic="TExtra = unknown">
type Foo = TExtra & { bar: string };

defineProps<{ items: Foo[] }>();
defineSlots<{ default: (props: { item: Foo }) => unknown }>();
</script>

<template>
  <slot :item="{ bar: 'a' } as Foo" />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import Child from "./Child.vue";

const items = [{ bar: "a", baz: 1 }];
</script>

<template>
  <Child :items>
    <template #default="{ item }">
      {{ item.baz }}
    </template>
  </Child>
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(10,15): error TS2339: Property 'baz' does not exist on type '{ bar: string; }'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `item.nope` in place of `item.baz` gives TS2339 in both tools.

## Cause

The cause is likely: `define_slots_type_requires_setup_scope` has no generic clause, and its sibling for props has one.

`define_props_type_requires_setup_scope` returns true for a generic component (`crates/vize_canon/src/virtual_ts/generator/setup_scope.rs:22`):

```rust
super::generics::setup_signature(summary).1.is_some()
```

`define_slots_type_requires_setup_scope` (`setup_scope.rs:53`) tests only:

```rust
.is_some_and(|args| macro_type_requires_setup_scope(summary, args))
```

`macro_type_requires_setup_scope` treats the hoisted alias `Foo` as visible at module scope (`setup_scope.rs:79`, `return !export.hoisted;`). So the slots type goes into a module-level `$Slots`, and `Foo` there is a second copy with every generic parameter defaulted. A parameter with no default gets one added (`crates/vize_canon/src/virtual_ts/generic_parameters.rs:323`, `output.push_str(" = any");`). The module-level copy is `Foo<TExtra = unknown>`, and the consumer sees `unknown & { bar: string }`.

The same cause applies when the parameter has no default. With `generic="T extends string"`, `type Item = { foo: T }` and a slot payload `{ item: Item }`, the consumer sees `item.foo` as `any`, and `tsrs` misses the real error that `vue-tsc` reports for `item.foo.bar`.

The fix is likely to give `define_slots_type_requires_setup_scope` the generic clause of the props function, so the slots type stays inside `__setup`.

## Real occurrence

The shape in a real Nuxt app: [`Ui/List/Index.vue` lines 8 to 30](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Ui/List/Index.vue#L8-L30) declares `type ExtendedListItem = TExtra & UiListItem<T>` in a generic component and uses it in `defineSlots`. `vue-tsc` accepts every parent of it.

## Not known

Versions before 0.638.0 are not tested for this input. The fix is read from the source and not applied.

## Not a duplicate of

Searched open and closed issues and pull requests for generic slots, type aliases and module scope. The search matches words, not meaning. The nearest are #10221 and #10886 (both merged; they capture setup-scoped slot types and child-side outlets) and #3354 (closed; generic constructors do not instantiate slot parameters). In this report the slots type is not setup-scoped because the alias is hoisted.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
