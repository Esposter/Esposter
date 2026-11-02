# content-mapper: the event payload of a generic library component is `any`, so a `typeof` guard narrows it to `string` and a generic target rejects it

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`. This issue comes from the first step, the type check, and is one of a few I ran into.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

A generic component from a library (a function that returns `VNode & { __ctx }`) gets an `any` payload in a template listener. A `typeof value === 'string'` check narrows `any` to `string`. The mapper then reports TS2322 when the code assigns `value` to a generic model. `vue-tsc` infers the payload from the bound props, so it reports nothing.

This is the "second symptom" of the closed #11363, after the dotted tag was linked. The tag form does not matter: `<Foo>` and `<Parts.Foo>` give the same result.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which reports no diagnostic for the reproduction.

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
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.vue"]
}
```

`src/lib.ts` is the shape that `vue-tsc` writes for a generic component in a library declaration:

```ts
import type { VNode } from "vue";

export declare const Foo: <TBar>(
  props: NonNullable<Awaited<typeof setup>>["props"],
  setup?: Promise<{ props: { modelValue?: TBar; "onUpdate:modelValue"?: (value: TBar) => void } }>,
) => VNode & { __ctx?: NonNullable<Awaited<typeof setup>> };
```

`src/Probe.vue`:

```vue
<script setup lang="ts" generic="TBaz extends string">
import { Foo } from "./lib";

const model = defineModel<TBaz>({ required: true });
</script>

<template>
  <Foo
    :model-value="model"
    @update:model-value="
      (value) => {
        if (typeof value === 'string') model = value;
      }
    "
  />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(12,40): error TS2322: Type 'string' is not assignable to type 'TBaz'.
  'string' is assignable to the constraint of type 'TBaz', but 'TBaz' could be instantiated with a different subtype of constraint 'string'.
```

The position is in the source file.

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` infers `TBar` as `TBaz` from `:model-value="model"`, so `value` has the type `TBaz` and the guard keeps it.

`vue-tsc` reads the file. A line `const bad: number = "x";` before `const model` gives `src/Probe.vue(4,7): error TS2322: Type 'string' is not assignable to type 'number'.` in both tools.

The payload type shows the difference. With the handler body `const payload: never = value;`, `tsrs` reports `Type 'any' is not assignable to type 'never'.` and `vue-tsc` reports `Type 'TBaz' is not assignable to type 'never'.`

## Cause

The cause is: the mapper types the payload of a library generic component as `any`, and `typeof` narrows `any` to `string`.

The mapper marks a callable that returns a type with `__ctx` as a library generic export. It sets the listener arguments to `unknown[]` for it (`crates/vize_canon/src/virtual_ts/scope/component_events.rs:170`):

```rust
// A vue-tsc generic library export instantiates its generics with their
// constraints here; its listener stays untyped rather than wrong.
```

```rust
"{indent}type {prop_args} = {prop_args}_library extends true ? unknown[] : …"
```

(line 207). The inference call for the listener cannot supply the arguments, because only a constructor gets a call-site inference. A function component falls to `(component: C) => (props: any) => {}` (`crates/vize_canon/src/virtual_ts/helpers/declarations/emit-inference.d.ts.txt:9`):

```
type $NativeEmitPropsFactory<C> = C extends new (...args: any[]) => { $emit: any } ? … : (component: C) => (props: any) => {};
```

So every source of the arguments is `unknown[]`. The event type is `any` (`component_events.rs:334`, `unknown[] extends __A ? any`) and the listener is `(...args: any[]) => any` (`component_events.rs:391`). The `any` is not neutral: the guard turns it into `string`, and an assignment to a generic target fails. The comment says "untyped rather than wrong". The result is wrong for a guarded payload.

The change is likely: for a function component with `__ctx`, take the payload from the call that already instantiates the generic from the bound props (the call that checks the props), as `vue-tsc` does.

## Real occurrence

[`Ui/Tabs.vue` line 34](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Ui/Tabs.vue#L34) has the same guarded assignment in a `<Tabs.Root>` listener. `Tabs` is the namespace import `import { Tabs } from "@vuetify/v0"` (1.3.1), whose `Root` has this declaration. `vue-tsc` accepts the file.

## Isolation

One change at a time from the reproduction, on `vize` 0.650.0 unless the row says otherwise.

| Change                                                          | `tsrs` | `vue-tsc` |
| :-------------------------------------------------------------- | :----- | :-------- |
| none                                                            | TS2322 | none      |
| `Foo` returns `VNode` with no `__ctx`                           | TS2322 | TS2322    |
| `Foo` is a generic `.vue` file (`generic="TBar"`)               | none   | none      |
| the consumer has `generic="TBaz"` with no constraint            | TS2322 | none      |
| the consumer is not generic (`defineModel<string>`)             | none   | none      |
| dotted tag `<Parts.Foo>` with `export const Parts = { Foo }`    | TS2322 | none      |
| the handler is `if (typeof $event === 'string') model = $event` | TS2322 | none      |
| the handler parameter is `(value: unknown)`                     | TS2322 | TS2322    |
| `Foo` is `Tabs.Root` from `@vuetify/v0` 1.3.1                   | TS2322 | none      |
| `vize` 0.638.0, 0.645.0 or 0.651.0                              | TS2322 | none      |

The trigger is a generic target, a `typeof` guard and a library generic component with `__ctx`. The tag form is not a condition. A generic `.vue` file is not affected, because the mapper generates its own resolver for it. This is not a regression: 0.638.0 gives the same result.

## Not known

The fix is read from the source and not applied. The reproduction copies the declaration shape by hand. The row for `@vuetify/v0` uses the real package.

The same real file also reports `TS2353` for the `data-variant` attribute and for a UnoCSS attribute on a `<Tabs.Item>` and a `<Tabs.Panel>`. That is a separate class (unknown attributes on a typed component) and is not in this report.

## Not a duplicate of

Searched open and closed issues and pull requests for generic library components, event payloads, `__ctx`, `typeof` narrowing and `update:model-value`. The search matches words, not meaning.

- #11363 (closed): the dotted tag was not linked, and its second symptom is this payload. The fix links the tag. The reproduction of #11363 passes on 0.650.0, because its child is a `.vue` file. A library declaration with `__ctx` takes another path.
- #9103 (merged): checks a library generic child by calling it with the props. Its description lists "listener payloads on these library children are untyped here (vue-tsc infers them)" as a trade-off. This report is the consequence of that trade-off.
- #10416 (closed): the slot props of a construct-signature generic component were `unknown`. It is about slots and a constructor.
- #3908 and #4996 (closed): the update payload of `defineModel` and narrowing by inline assignments. Neither names a library component.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
