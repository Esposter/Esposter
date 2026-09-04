# Typing a component's props, models and variants

Read when a prop or model type depends on an enum/discriminant key, when one component is absorbing several data variants, or when a boolean prop has a default. The `is` prefix and the "type as the non-default literal" rule itself are in `SKILL.md`.

## Generic SFC components

When a component's model value (or other prop) type depends on an enum/discriminant key, make the component generic:

```vue
<script setup lang="ts" generic="TKey extends SomeEnum">
// SomeEnum is a string enum (e.g. SomeEnum.A = "A"), so interface keys are string literals.
// Model values use "" as the empty-string sentinel and never `| null` (see the typescript / string-utils skills):
interface ModelValueMap {
  A: boolean;
  B: string;
}

const modelValue = defineModel<ModelValueMap[TKey]>({ required: true });
</script>
```

- Use `interface` (not `type`) for the value map — string enum values map directly to string literal keys.
- Define the interface locally (not exported unless reused elsewhere).
- The map type drives inference at call sites where the key type is statically known.
- For `as const satisfies` maps, use `Record<Exclude<TEnum, ExcludedVariant>, ValueType>` to exclude variants using a different component path (e.g. Boolean → checkbox, not text field).
- If TypeScript can't narrow `TKey` in template `v-if`/`v-else` branches (correlated generics limitation), fall back to the union of all possible values (e.g. `FooValue`) for `defineModel` — the prop type still provides call-site inference.

## Per-variant type correctness

**Match each component's props/model types exactly to the data it handles** — don't mix concerns via union types + `v-if` + null-coalescing inside one component.

- If logic differs per variant (e.g. date formatting for `BarFoo` vs plain text for `Foo<Baz>`), split into focused components (`FooInputBar.vue`, `FooInputBaz.vue`).
- Each component accesses its props directly without defensive coalescing (`foo.format`, not `foo.type === FooType.Bar ? foo.format : ""`).
- A **dispatcher** component (e.g. `FooInput.vue`) is acceptable at the routing level to delegate to the right sub-component — type casts in the dispatcher are necessary and acceptable at that boundary.

## Boolean props — the literal forms

```ts
// Foo.vue — defaults false → only `true` is meaningful
interface Props {
  isDense?: true;
}
const { isDense } = defineProps<Props>(); // isDense: true | undefined
```

```ts
// Bar.vue — defaults true → only `false` is meaningful
interface Props {
  isInteractive?: false; /* ... */
}
const { isInteractive = true } = defineProps<Props>(); // boolean at runtime
```

A **derived/computed** value still fits the literal type as long as it can only be the default or its opposite — map the default branch to `undefined` instead of widening to `boolean`:

```vue
<!-- isDense ? false : undefined → type `false | undefined`, matches `isInteractive?: false` -->
<Bar :is-interactive="isDense ? false : undefined" />
```

**Exception — genuinely two-way boolean.** Use the full `boolean` type only when the prop carries a real, changeable boolean: a `v-model` / `defineModel<boolean>()`, or a ref/computed whose value legitimately flips **both** ways at the call site. A flag that only ever toggles away from its default is not this case — keep it a literal.
